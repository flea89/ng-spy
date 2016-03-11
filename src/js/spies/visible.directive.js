const mod = angular.module('spy.spies.visible', []);

mod.directive('spyVisible', [
    '$window',
    '$parse',
    '$timeout',
    'clientRect',
    ($window, $parse, $timeout, clientRect) => {
        return {
            restrict: 'A',
            require: '^^spyScrollContainer',
            link (scope, elem, attrs, ctrl) {
                let rect = {},
                    isHidden = false,
                    scrollContainer,
                    api = {
                        updateClientRect () {
                            const cRect = clientRect(scrollContainer, elem[0]);
                            rect = cRect.rect;
                            isHidden = cRect.isHidden;
                        },
                        update (viewportRect) {
                            let isFullyVisible = (rect.top >= viewportRect.top && //Top border in viewport
                                (rect.top + rect.height) <= (viewportRect.top + viewportRect.height)) || //Bottom border in viewport
                                (rect.top <= viewportRect.top && rect.top + rect.height >= viewportRect.top + viewportRect.height), // Bigger than viewport

                                isFullyHidden = !isFullyVisible &&
                                rect.top > (viewportRect.top + viewportRect.height) || //Top border below viewport bottom
                                (rect.top + rect.height) < viewportRect.top; //Bottom border above viewport top

                            //Only change state when fully visible/hidden
                            if (isFullyVisible) {
                                api.setInView(true);
                            } else if (isFullyHidden) {
                                api.setInView(false);
                            }
                        },
                        getRect () {
                            return rect;
                        },
                        setInView (inView) {
                            if ($parse(attrs.spyVisible)(scope) !== inView && !isHidden) {
                                scope.$evalAsync(() => {
                                    const spyVisibleSetter = $parse(attrs.spyVisible);
                                    spyVisibleSetter.assign(scope, inView);
                                });
                            }
                        }
                    };
                if (angular.isDefined(attrs.triggerUpdate)) {
                    scope.$watch(attrs.triggerUpdate, function (newVal, oldVal) {
                        if (newVal !== oldVal) {
                            $timeout(function () {
                                api.updateClientRect();
                                api.update();
                            }, 0);
                        }
                    });
                }

                scrollContainer = ctrl.getScrollContainer() || $window.document.body;
                ctrl.registerSpy(api);
                api.updateClientRect();
            }
        };
    }]);

export default mod;
