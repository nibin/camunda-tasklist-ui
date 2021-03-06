define([
  'angular'
], function(
  angular
) {

  'use strict';

  return [
    '$scope',
    '$translate',
    'debounce',
    'Notifications',
    'processData',
  function(
    $scope,
    $translate,
    debounce,
    Notifications,
    processData
  ) {

    function errorNotification(src, err) {
      $translate(src).then(function(translated) {
        Notifications.addError({
          status: translated,
          message: (err ? err.message : '')
        });
      });
    }

    function successNotification(src) {
      $translate(src).then(function(translated) {
        Notifications.addMessage({
          duration: 3000,
          status: translated
        });
      });
    }

    // setup ////////////////////////////////////////////////////////////////////////

    $scope.$on('$locationChangeSuccess', function() {
      $scope.$dismiss();
    });

    var processStartData = processData.newChild($scope);

    // initially always reset the current selected process definition id to null
    processStartData.set('currentProcessDefinitionId', { id: null });

    var DEFAULT_OPTIONS = $scope.options = {
      hideCompleteButton : true,
      disableForm : false,
      disableAddVariableButton: false
    };

    $scope.PROCESS_TO_START_SELECTED = false;

    var query = null;

    var page = $scope.page = {
      total: 0,
      current: 1,
      searchValue: null
    };

    $scope.triggerOnStart = function () {};

    // observe /////////////////////////////////////////////////////////////////////////////////////

    processStartData.observe('processDefinitionQuery', function(_query) {
      query = angular.copy(_query);

      page.size = _query.maxResults;
      page.current = (_query.firstResult / page.size) + 1;
    });

    $scope.startFormState = processStartData.observe('startForm', function (startForm) {
      $scope.startForm = angular.copy(startForm);
    });

    $scope.processDefinitionState = processStartData.observe('processDefinitions', function (processDefinitions) {

      page.total = processDefinitions.count;

      $scope.processDefinitions = processDefinitions.items.sort(function(a, b) {
        var aName = (a.name || a.key).toLowerCase();
        var bName = (b.name || b.key).toLowerCase();
        if (aName < bName)
           return -1;
        if (aName > bName)
          return 1;
        return 0;
      });

    });

    // select process definition view //////////////////////////////////////////////////////

    $scope.pageChange = function() {
      query.firstResult = page.size * (page.current - 1);
      processStartData.set('processDefinitionQuery', query);
    };

    $scope.lookupProcessDefinitionByName = debounce(function() {
      var nameLike = page.searchValue;

      if (!nameLike) {
        delete query.nameLike;
      }
      else {
        query.nameLike = '%' + nameLike + '%';
      }

      // reset first result of query
      query.firstResult = 0;

      processStartData.set('processDefinitionQuery', query);


    }, 2000);

    $scope.selectProcessDefinition = function(processDefinition) {
      $scope.PROCESS_TO_START_SELECTED = true;
      $scope.options = angular.extend({}, { processDefinitionId : processDefinition.id }, DEFAULT_OPTIONS);
      processStartData.set('currentProcessDefinitionId', { id: processDefinition.id });
    };

    // start a process view /////////////////////////////////////////////////////////////////

    $scope.$invalid = true;

    $scope.back = function() {
      $scope.$invalid = true;
      $scope.PROCESS_TO_START_SELECTED = false;
      $scope.options = DEFAULT_OPTIONS;
      processStartData.set('currentProcessDefinitionId', { id: null });
    };

    // will be called when the form has been submitted
    $scope.completionCallback = function(err) {
      if (err) {
        return errorNotification('PROCESS_START_ERROR', err);
      }

      $scope.$close();
      successNotification('PROCESS_START_OK');
    };

    // will be called on initialization of the 'form'-directive
    $scope.registerCompletionHandler = function (fn) {
      // register a handler when a process should be started
      $scope.triggerOnStart = fn || function () {};
    };

    // will be triggered when the user select on 'Start'
    $scope.startProcessInstance = function () {
      $scope.triggerOnStart();
    };

    // will be called the validation state has been changed
    $scope.notifyFormValidation = function (invalid) {
      $scope.$invalid = invalid;
    };

  }];

});