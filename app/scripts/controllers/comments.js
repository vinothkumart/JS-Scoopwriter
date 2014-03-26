'use strict';

/**
* AngularJS controller for managing article comments (as a group,
* not individual comments).
*
* @class CommentsCtrl
*/
angular.module('authoringEnvironmentApp').controller(
    'CommentsCtrl', ['$scope', 'comments', 'article', '$location', '$log',
    function ($scope, comments, article, $location, $log) {

        var queryParams = $location.search();
        var others = ['pending', 'approved', 'hidden'];

        $scope.sortings = [{
            text: 'Nested'
        }, {
            text: 'Chronological'
        }, {
            text: 'Chronological (asc.)'  // oldest first
        }];
        $scope.sorting = $scope.sortings[0];
        $scope.toggle = function(name) {
            var previouslyChecked = $scope.statuses[name];
            $scope.statuses[name] = !previouslyChecked;
            if ('all' == name) {
                if (previouslyChecked) {
                    others.map(function(name) {
                        $scope.statuses[name] = true;
                    });
                } else {
                    others.map(function(name) {
                        $scope.statuses[name] = false;
                    });
                }
            } else {
                /* if this is going to be unchecked (so it was checked
                 * before) and all the others are unchecked, check the
                 * `all` status again */
                if (previouslyChecked) {
                    if (others.every(function(name) {
                        return false == $scope.statuses[name];
                    })) {
                        $scope.statuses.all = true;
                    }
                } else {
                    $scope.statuses.all = false;
                }
            }
        };

        // commenting options on the *article*
        // TODO: and add tests (default value)
        $scope.commenting = article.commenting.ENABLED;
        $scope.commentingOpts = [
            {
                value: article.commenting.ENABLED,
                label: 'enabled'
            },
            {
                value: article.commenting.DISABLED,
                label: 'disabled'
            },
            {
                value: article.commenting.LOCKED,
                label: 'locked'
            }
        ];

        // TODO: YUIDoc comments ...
        this.init = function () {
            article.resource.get({
                 articleId: queryParams.article_number,
                 language: queryParams.language
             }).$promise.then(function (data) {
                if (parseInt(data.comments_locked, 10) > 0) {
                    $scope.commenting = article.commenting.LOCKED;
                } else if (parseInt(data.comments_enabled, 10) > 0) {
                    $scope.commenting = article.commenting.ENABLED;
                } else {
                    $scope.commenting = article.commenting.DISABLED;
                }
            });
        }

        this.init();

        $scope.statuses = {
            all: true,
            pending: false,
            approved: false,
            hidden: false
        };
        $scope.selected = function(comment) {
            if ($scope.statuses.all) {
                return true;
            }
            if ($scope.statuses[comment.status]) {
                return true;
            }
            return false;
        };

         // whether or not a new comment is being sent at this very moment
        $scope.isSending = false;

        $scope.comments = comments;
        $scope.create = {};
        comments.init();
        $scope.add = function(par) {
            $scope.isSending = true;
            comments.add(par).then(function() {
                $scope.adding = false; // collapse the form
                $scope.isSending = false;
                $scope.create = {};
            }, function () {
                // on failures (e.g. timeouts) we re-enable the form, allowing
                // user to submit a comment again
                $scope.isSending = false;
            });
        };
        $scope.cancel = function() {
            $scope.adding = false;
            $scope.create = {};
        };
        $scope.globalShowStatus = 'collapsed';
        $scope.$watch('globalShowStatus', function() {
            comments.displayed.map(function(comment) {
                comment.showStatus = $scope.globalShowStatus;
            });
        });

        // TODO: comment and tests
        $scope.switchCommentingSetting = function (newValue, $event) {
            var apiParams,
                origValue;

            $event.preventDefault();

            if (newValue === $scope.commenting) {
                return;  // no changes, nothing to do
            }

            origValue = $scope.commenting;
            $scope.commenting = newValue;

            apiParams = {
                comments_enabled:
                    (newValue === article.commenting.ENABLED) ? 1 : 0,
                comments_locked:
                    (newValue === article.commenting.LOCKED) ? 1 : 0
            }

            article.resource.save(
                {
                    articleId: queryParams.article_number,
                    language: queryParams.language
                },
                apiParams
            ).$promise.then(function (data) {
                // success, don't need to do anything
            }, function () {
                // XXX: when consistent reporting mechanism is developed,
                // inform user about the error (API failure) - the reason
                // why the value has been switched back to origValue
                $scope.commenting = origValue;
            });
        };

        /**
        * Changes global comments display status from expanded to collapsed or
        * vice versa.
        * @method toggleShowStatus
        */
        $scope.toggleShowStatus = function () {
            $scope.globalShowStatus = ($scope.globalShowStatus === 'expanded')
                ? 'collapsed' : 'expanded';
        };

        $scope.$watch('sorting', function() {
            /* this log here is a way to test that the handler has
             * been called, it is mocked in tests */
            $log.debug('sorting changed');
            if(comments.canLoadMore) {
                if ($scope.sorting.text == 'Nested') {
                    comments.init({
                        sorting: 'nested'
                    });
                } else {
                    comments.init({
                        sorting: 'chronological'
                    });
                }
            }
        });
    }]);
