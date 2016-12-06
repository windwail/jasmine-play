describe("Check todo controller", function() {
    var scope = {};

    beforeEach(function(){
        module('todo');
        inject(function($controller){
            $controller('TodoController',{$scope:scope});
        });
    });

    it('should define a list object',function(){
        expect(scope.list).toBeDefined();
    });
})