'use strict';

describe('my app', function () {



        browser.get('http://localhost:8000');

        it('soooo', function () {
            //var elements = element.all(protractor.By.css('.clearfix .col206'));

            element.all(by.className('.mine')).count().then(function(text) {
                console.log(text);
            });

            expect(element.all(by.className('.mine')).count()).toEqual(3);

        });


});
