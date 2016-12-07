'use strict';

describe('my app', function () {

    describe('view1', function () {

        beforeEach(function () {
            browser.get('/');
        });


        it('', function () {
            var todoListItems = element.all(by.repeater('item in list'));
            expect(todoListItems.count()).toBe(3);
        });

    });

});
