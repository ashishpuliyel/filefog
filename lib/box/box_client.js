var Q = require('q')
    , request = require('request')
    , winston = require('winston')
    , errorTypes = require('../errors.js')
    , FFParameterAbsent = errorTypes.FFParameterAbsent
    , FFTokenRejected = errorTypes.FFTokenRejected
    , FFAdditionalAuthorizationRequired = errorTypes.FFAdditionalAuthorizationRequired

module.exports = function (oauth_data, provider_options) {
    var _oauth_data = oauth_data;

    var _boxClientPromise = null

    function getClient() {
        if (_boxClientPromise) return _boxClientPromise
        var options = {
            headers: {
                'Authorization': 'Bearer ' + _oauth_data.access_token
            }
        };
        _boxClientPromise = Q.when(request.defaults(options))
        return _boxClientPromise;
    }

    //custom error detection method.
    function errorHandler(response, err){
        if(err) return err;

        //error codes parsed from http://developers.box.com/oauth/
        var err_message = response.headers['www-authenticate'] || ''
        if(response.statusCode == 400) return new FFParameterAbsent(err_message);
        if(response.statusCode == 401) return  new FFTokenRejected(err_message);
        if(response.statusCode == 403) return new FFAdditionalAuthorizationRequired(err_message);

        return false;
    }


    this.AccountInfo = function (options) {
        return getClient().then(function (client) {
            var deferred = Q.defer();
            client.get(
                {
                    url: 'https://api.box.com/2.0/users/me'
                },
                function (err, r, body) {
                    err = errorHandler(r,err);
                    if (err) return deferred.reject(err);
                    return deferred.resolve({ "response": r, "body": body});
                }
            );
            return deferred.promise;
        })
    }


    this.CreateFile = function (fileName, parentIdentifier, content_buffer, options) {
        parentIdentifier = parentIdentifier || '0'
        return getClient().then(function (client) {
            var deferred = Q.defer();
            client.post({
                    url: 'https://upload.box.com/api/2.0/files/content',
                    headers: {
                        'Authorization': 'Bearer ' + _oauth_data.access_token,
                        'content-type': 'multipart/form-data'
                    },
                    multipart: [
                        {
                            'content-type': 'application/octet-stream',
                            'content-disposition': 'form-data; filename="' + fileName + '"; name="filename"',
                            body: content_buffer
                        },
                        {
                            'content-disposition': 'form-data; name="folder_id"',
                            body: parentIdentifier
                        }
                    ]
                },
                function (err, r, body) {
                    err = errorHandler(r,err);
                    if (err) return deferred.reject(err);
                    return deferred.resolve({ "response": r, "body": body});
                });

            return deferred.promise;
        })
    }

    this.DeleteFile = function (identifier) {
        return getClient().then(function (client) {
            var deferred = Q.defer();
            client.del(
                {
                    url: 'https://api.box.com/2.0/files/' + identifier
                },
                function (err, r, body) {
                    err = errorHandler(r,err);
                    if (err) return deferred.reject(err);
                    return deferred.resolve({ "response": r, "body": body});
                }
            );
            return deferred.promise;
        })
    }
    this.DownloadFile = function (identifier) {
        return getClient().then(function (client) {
            var deferred = Q.defer();
            client.get(
                {
                    url: 'https://api.box.com/2.0/files/' + identifier + '/content',
                    encoding: null /*forces the content to be sent back in binary form, body will always be a buffer.*/
                },
                function (err, r, body) {
                    err = errorHandler(r,err);
                    if (err) return deferred.reject(err);
                    return deferred.resolve({ "response": r, "body": body});
                }
            );
            return deferred.promise;
        })
    }
    this.GetFileInformation = function (identifier) {
        return getClient().then(function (client) {
            var deferred = Q.defer();
            client.get(
                {
                    url: 'https://api.box.com/2.0/files/' + identifier
                },
                function (err, r, body) {
                    err = errorHandler(r,err);
                    if (err) return deferred.reject(err);
                    return deferred.resolve({ "response": r, "body": body});
                }
            );
            return deferred.promise;
        })
    }

    this.CreateFolder = function (folderName, parentIdentifier, options) {
        parentIdentifier = parentIdentifier || '0'
        return getClient().then(function (client) {
            var deferred = Q.defer();
            client.post(
                {
                    url: 'https://api.box.com/2.0/folders',
                    body: '{"name":"' + folderName + '", "parent": {"id": "' + parentIdentifier + '"}}'
                },
                function (err, r, body) {
                    err = errorHandler(r,err);
                    if (err) return deferred.reject(err);
                    return deferred.resolve({ "response": r, "body": body});
                }
            );
            return deferred.promise;
        })
    }

    this.DeleteFolder = function (identifier) {
        return getClient().then(function (client) {
            var deferred = Q.defer();
            client.del(
                {
                    url: 'https://api.box.com/2.0/folders/' + identifier
                },
                function (err, r, body) {
                    err = errorHandler(r,err);
                    if (err) return deferred.reject(err);
                    return deferred.resolve({ "response": r, "body": body});
                }
            );
            return deferred.promise;
        })
    }
    this.GetFolderInformation = function (identifier) {
        return getClient().then(function (client) {
            var deferred = Q.defer();
            client.get(
                {
                    url: 'https://api.box.com/2.0/folders/' + identifier
                },
                function (err, r, body) {
                    err = errorHandler(r,err);
                    if (err) return deferred.reject(err);
                    return deferred.resolve({ "response": r, "body": body});
                }
            );
            return deferred.promise;
        })
    }

    this.RetrieveFolderItems = function (identifier, options) {
        return getClient().then(function (client) {
            var deferred = Q.defer();
            client.get(
                {
                    url: 'https://api.box.com/2.0/folders/' + identifier + '/items'
                },
                function (err, r, body) {
                    err = errorHandler(r,err);
                    if (err) return deferred.reject(err);
                    return deferred.resolve({ "response": r, "body": body});
                }
            );
            return deferred.promise;
        })
    }
};
