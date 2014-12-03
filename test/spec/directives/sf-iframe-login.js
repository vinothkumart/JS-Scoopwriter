'use strict';

/**
* Module with tests for the sfIframeLogin directive.
*
* @module sfIframeLogin directive tests
*/

describe('Directive: sfIframeLogin', function () {
    var scope,
        configuration,
        $compile;

    /**
    * Helper function which generates HTML snippet with the directive element
    * containing all given attributes.
    *
    * @function createHtmlTemplate
    * @param attrs {Object} mapping containing attribute names and their
    *   corresponding values
    * @return {String} generated HTML snippet
    */
    function createHtmlTemplate(attrs) {
        var html = ['<sf-iframe-login'];

        attrs = attrs || {};
        Object.keys(attrs).forEach(function (key) {
            html.push(' ' + key + '="' + attrs[key] + '"');
        });

        html.push('></sf-iframe-login>');
        return html.join('');
    }

    /**
    * Helper function that compiles an HTML template and links it with
    * provided scope.
    *
    * @function compileElement
    * @param template {String} HTML snippet to compile
    * @param scope {Object} scope to link the compiled element against
    * @return {Object} jQuery element representing the result of compilation
    */
    function compileElement(template, scope) {
        var $element = $compile(template)(scope);
        scope.$digest();
        return $element;
    }

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function (_$compile_, $rootScope, _configuration_) {
        $compile = _$compile_;
        configuration = _configuration_;
        scope = $rootScope.$new();
    }));

    it('produces an iframe', function () {
        var $element,
            template = createHtmlTemplate({'on-load': 'foo()'});

        $element = compileElement(template, scope);
        expect($element.is('iframe')).toBe(true);
    });

    it('throws an error if onLoad handler is not specified', function () {
        var template = createHtmlTemplate();
        expect(function () {
            compileElement(template, scope);
        }).toThrow();
    });

    describe('setting element attributes', function () {
        it('sets width to 570 by default', function () {
            var $element,
                template = createHtmlTemplate({'on-load': 'foo()'});
            $element = compileElement(template, scope);
            expect($element.attr('width')).toEqual('570');
        });

        it('sets width to given value, if available', function () {
            var $element,
                template = createHtmlTemplate({
                    width: 267,
                    'on-load': 'foo()'
                });
            $element = compileElement(template, scope);
            expect($element.attr('width')).toEqual('267');
        });

        it('sets height to 510 by default', function () {
            var $element,
                template = createHtmlTemplate({'on-load': 'foo()'});
            $element = compileElement(template, scope);
            expect($element.attr('height')).toEqual('510');
        });

        it('sets height to given value, if available', function () {
            var $element,
                template = createHtmlTemplate({
                    height: 567,
                    'on-load': 'foo()'
                });
            $element = compileElement(template, scope);
            expect($element.attr('height')).toEqual('567');
        });

        it('sets correct src', function () {
            var $element,
                expectedUrl,
                template = createHtmlTemplate({'on-load': 'foo()'});

            configuration.auth = {
                server: 'http://login.com/form',
                'redirect_uri': 'http://redirect.com'
            };

            expectedUrl = [
                'http://login.com/form',
                '?client_id=123_qwertz',  // determined from global CSClientId
                '&redirect_uri=http://redirect.com',
                '&response_type=token'
            ].join('');

            $element = compileElement(template, scope);
            expect($element.attr('src')).toEqual(expectedUrl);
        });
    });

    describe('element\'s onLoad handler', function () {
        var $element,
            handlerSpy;

        beforeEach(function () {
            var template = createHtmlTemplate({'on-load': 'foo()'});
            scope.foo = jasmine.createSpy();
            $element = compileElement(template, scope);

            // XXX: how to mock $element[0].contentWindow? It's a read-only
            // attribute and because it is null in tests, an error occurs
            // in the onLoad handler, making it difficult (impossible?) to test
            // whether the provided handler is invoked with correct parameters,
            //  etc.
        });

        it('', function () {
            var isoScope = $element.isolateScope();
            spyOn(isoScope, 'onLoadHandler');

            $element.triggerHandler('load');

            // XXX: this would fail:
            // expect(isoScope.onLoadHandler).toHaveBeenCalledWith(
            //     mocked_contentWindow_here
            // );
        });
    });

});
