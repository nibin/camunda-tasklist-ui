define([
  'angular',
  'text!./cam-sorting-choices.html'
], function(
  angular,
  template
) {
  'use strict';

  return [function() {
    return {

      restrict: 'EAC',
      scope: {
        tasklistData: '='
      },

      template: template,

      link: function(scope, element, attrs) {

        var tasklistData = scope.tasklistData.newChild(scope);
        var query;

        scope.order = null;
        scope.by = null;
        scope.byLabel = null;

        /**
         * observe the task list query
         */
        tasklistData.observe('taskListQuery', function(taskListQuery) {
          query = angular.copy(taskListQuery);
          scope.order = query.sortOrder;
          scope.by = query.sortBy;
          scope.byLabel = element.find('[sort-by="'+ scope.by +'"]').text();
        });

        /**
         * invoked when the sort order is changed
         */
        scope.changeOrder = function() {
          // update query
          query.sortOrder = scope.order === 'asc' ? 'desc' : 'asc';
          tasklistData.set('taskListQuery', query);
        };

        /**
         * invoked when the sort property is changed
         */
        scope.changeBy = function(by) {
          // close dropdown
          element.find('.dropdown.open').removeClass('open');

          // update query
          query.sortBy = by;
          tasklistData.set('taskListQuery', query);
        };

      }
    };
  }];
});
