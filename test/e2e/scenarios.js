'use strict';

describe('my app', function () {



        browser.get('http://localhost:8000');

        it('soooo', function () {
            //var elements = element.all(protractor.By.css('.clearfix .col206'));

            expect(element.all(by.repeater('item in list')).count()).toEqual(3);

        });


});
