'use strict';

describe('my app', function () {

        browser.get('/');

        it('soooo', function () {
            var todoListItems = element.all(by.repeater('item in list'));
            expect(todoListItems.count()).toBe(4);
        });


});
