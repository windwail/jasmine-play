angular.module('todo', [])
    .controller('TodoController', ['$scope', function($scope) {
        $scope.list = ['test','execute','refactor'];
    }]);