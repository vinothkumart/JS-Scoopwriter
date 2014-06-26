'use strict';

/**
* A factory which creates a Newscoop image model (representing an image in
* Newscoop).
*
* NOTE: Image is the name of the built in native object, thus the "Nc" prefix.
*
* @class NcImage
*/
angular.module('authoringEnvironmentApp').factory('NcImage', [
    '$http',
    '$q',
    'configuration',
    function ($http, $q, configuration) {
        var API_ROOT = configuration.API.full,
            NcImage;

        /**
        * NcImage constructor function.
        *
        * @function NcImage
        * @param data {Object} object containing initial image data
        *   (NOTE: irrelevant keys are ignored)
        */
        NcImage = function (data) {
            var that = this,
                relevantKeys;

            relevantKeys  = [
                'id', 'basename', 'thumbnailPath', 'description',
                'width', 'height', 'photographer', 'photographerUrl'
            ];

            data = data || {};
            relevantKeys.forEach(function (key) {
                that[key] = data[key];
            });
        };

        /**
        * Retrieves a specific Newscoop image from the server.
        *
        * @method getById
        * @param id {Number} image ID
        * @return {Object} promise object which is resolved with a new NcImage
        *   instance on success and rejected with server error message on
        *   failure
        */
        NcImage.getById = function (id) {
            var deferredGet = $q.defer(),
                url = API_ROOT + '/images/' + id;

            $http.get(url)
            .success(function (response) {
                deferredGet.resolve(new NcImage(response));
            }).error(function (responseBody) {
                deferredGet.reject(responseBody);
            });

            return deferredGet.promise;
        };

        return NcImage;
    }
]);
