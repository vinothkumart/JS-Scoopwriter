'use strict';

describe('Service: article', function () {

    // load the service's module
    beforeEach(module('authoringEnvironmentApp'));

    // instantiate service
    var article, $httpBackend, $rootScope;
    beforeEach(inject(function (_article_, _$httpBackend_, _$rootScope_) {
        article = _article_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
    }));
    afterEach(function() {
        $httpBackend.verifyNoOutstandingRequest();
        $httpBackend.verifyNoOutstandingExpectation();
    });

    it('should do something', function () {
        expect(!!article).toBe(true);
    });

    it('should define correct options for "commenting"', function () {
        var options = article.commenting;
        expect(options).not.toBeUndefined();
        expect(_.size(options)).toBe(3);
        expect('ENABLED' in options).toBe(true);
        expect(options.ENABLED).toBe(0);
        expect('DISABLED' in options).toBe(true);
        expect(options.DISABLED).toBe(1);
        expect('LOCKED' in options).toBe(true);
        expect(options.LOCKED).toBe(2);
    });

    it('is not modified', function() {
        expect(article.modified).toBe(false);
    });
    describe('initialised', function() {
        var earlyPromise = jasmine.createSpy('earlyPromise');
        beforeEach(function() {
            $httpBackend
                .expect('GET', rootURI + '/articles/64?language=de')
                .respond({});
            article.promise.then(function() {
                earlyPromise();
            });
            article.init({
                articleId: 64,
                language: 'de'
            });
        });
        describe('server answered', function() {
            beforeEach(function() {
                $httpBackend.flush();
            });
            it('keeps the early promise', function() {
                expect(earlyPromise).toHaveBeenCalled();
            });
            it('keeps a late promise', function(done) {
                var spy = jasmine.createSpy('spy');
                article.promise.then(function() {
                    spy();
                    done = true;
                });
                $rootScope.$apply();
                expect(spy).toHaveBeenCalled();
            });
            describe('initialised again', function() {
                beforeEach(function() {
                    article.init({
                        articleId: 64,
                        language: 'de'
                    });
                });
                it('does not require the article again', function() {
                    expect(true); // just to trigger before and after each
                });
                it('keeps another late promise', function(done) {
                    var spy = jasmine.createSpy('spy');
                    article.promise.then(function() {
                        spy();
                    });
                    $rootScope.$apply();
                    expect(spy).toHaveBeenCalled();
                });
            });
        });
    });

});
