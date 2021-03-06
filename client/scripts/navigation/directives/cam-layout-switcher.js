define([
  'angular',
  'text!./cam-layout-switcher.html'
], function(
  angular,
  template
) {
  'use strict';

  var $bdy = angular.element('body');

  var layouts = [
    {
      label: 'task',
      css: 'layout-focus-task'
    },
    {
      label: 'list',
      css: 'layout-focus-list'
    },
    {
      label: 'standard'
    }
  ];

  var layoutClasses = layouts.map(function(layout) {
    return layout.css || '';
  }).join(' ');

  return [function() {
    return {
      restrict: 'EAC',

      link: function(scope) {
        scope.activeLayout = parseInt(localStorage.hasOwnProperty('tasklistLayout') ?
                                      localStorage.tasklistLayout :
                                      (layouts.length - 1), 10);
        scope.activeLayoutInfo = layouts[scope.activeLayout];

        scope.layouts = layouts;

        scope.switchLayout = function(delta) {
          localStorage.tasklistLayout = delta;

          var layout = layouts[delta];
          scope.activeLayout = delta;
          scope.activeLayoutInfo = layout;

          $bdy
            .removeClass(layoutClasses)
            .addClass(layout.css)
          ;
        };

        scope.switchLayout(scope.activeLayout);
      },

      template: template
    };
  }];
});
