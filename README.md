#`var FileFog = require('filefog')`

There are many cloud storage options for consumers. However each provider has their own API and API design philosophy, making it harder for developers to easily integrate their applications.

The idea behind FileFog is to provide a single consistent, promise-based API for developers to access user uploaded data, without having to worry about differing OAuth implementations, base urls or data parsing.

The FileFog philosophy is as follows:

- __Don't reinvent the wheel__ - if a native library is available for NodeJS, use it. All we need  to do then is wrap the required methods to create a consistent user experience, and let the API designers themselves deal with most fo the implementation details.
- __Avoid Callback Hell__ - Javascript and most libraries built on-top of it heavily make use of callbacks. While this is perfectly fine for some, I prefer the Promise design pattern for its reliability, simplicity and synchronous feel when working with pseudo-filesystems.

# Providers
Initally FileFog will be released with only support for the following popular Cloud Services.

- Google
- SkyDrive
- Dropbox
- Box.net

Providers for the following Cloud Services are also planned:

- Bittorrent Sync
- AnyCloud
# Usage

    var FileFog = require('filefog')

# Quick Start
    //This configuration should only be run once on setup.
    FileFog.setConfig({
        google : {
          client_key : '777041726477-a5o1tp6f3i9m1me3tj5vhpnrn1jge43c.apps.googleusercontent.com',
          client_secret : 'mWURYHmMKZxr6aeR7DTjRu-q',
          client_scope : "https://www.googleapis.com/auth/drive"
        },
        skydrive : {
          client_key : '',
          client_secret : '',
          client_scope : "wl.basic wl.emails wl.offline_access wl.skydrive_update"
        },
        box : {
          client_key : 'cch3sssk23ueqsbdh2k2zlv2i7rz06lp',
          client_secret : '6v7ywbCdut5FRdIjDeREofrFGc2ymGmA'
        },
        dropbox : {
          client_key : 'sl47p7pijvtp73h',
          client_secret : 'j6vluc5yq7dxnj6'
        }
    });
    var googleProvider = FileFog.provider('google');


# Cloud Service Provider Methods


##`provider.oAuthGetAuthorizeUrl() `
Returns the URL of the third party service’s authorization page. This is the URL that your application should forward the user to in first leg of  OAuth 2. 

*Returns*
   `{String}` the authorization URL

##`provider.oAuthGetAccessToken(code) `
Used to swap the code provided by the OAuth redirect webhook into an access token (and refresh token if applicable)

*Parameters*
-  `code {String}` An authorization code you retrieved in the first leg of OAuth 2

*Returns*
   `{Promise}` A promise that will successfully resolve into an `Object` with the following parameters

   - *access_token* OAuth access token
   - *refresh_token* OAuth refresh token if available
   - *raw* the raw OAuth response, containing any additional data sent with the access_token

##`provider.oAuthRefreshAccessToken(oauth_data)`
When applicable this method can be used to swap a possibly expired `access_token` for a new `access_token` using the `refresh_token`. In the interest of keeping a consistent API this method will pass-through the `oauth_data` without changing it if the api does not support `refresh_token`s.

**Please note**, due to the way that certain API's work (re. Google) the result of this method call will extend the current `oauth_data.raw` object instead of sending back just the raw `refresh_token` data, to ensure that data is not lost. 

*Parameters*
-  `oauth_data {Object}` An object containing the `refresh_token` needed to generate a new `access_token`

*Returns*
   `{Promise}` A promise that will successfully resolve into an `Object` with the following parameters

   - *access_token* refreshed OAuth access token
   - *refresh_token* OAuth refresh token if available
   - *raw* the raw OAuth response, containing any additional data sent with the access_token

##`provider.CreateClient(oauth_data) `
This is a wrapper for the `client` constructor. It provides simple access to the cloud service `client`

*Parameters*
-  `oauth_data {Object}` An object containing the `access_token` needed to authenticate to the cloud API.

*Returns*
   `{Promise}` A promise that will successfully resolve into a `client`

# Client Methods

##`client.AccountInfo() `
Retrieves information about the logged in user.

*Parameters*

*Returns*
   `{Promise}` A promise that will successfully resolve into an `Object` with the following parameters

##`client.CheckQuota() `
Retrieves information about the logged in user's file storage quota. 

*Parameters*

*Returns*
   `{Promise}` A promise that will successfully resolve into an `Object` with the following parameters

##`client.CreateFile(fileName,parentIdentifier, content_buffer, options) `
Use the file upload or create API to allow users to add a new file. Depending on the service the `parentIdentifier` should the destination folder identifier or destination path for the file . If the user provides a file name that already exists in the destination folder, the user will receive an error. 

*Parameters*
-  `fileName {String}` The name of the file to be created on the cloud service
-  `parentIdentifier {String}` Depending on the service,this should either be the path of the file to be created or the identifier for the parent folder. Use `null` if the file should be created in the `root` cloud storage directory. 
-  `content_buffer {Buffer}` the contents to be written to the file
-  `options {Object}` (optional) one or more of the options below:
	
- **Dropbox**
	- *lastVersionTag (String)* — the identifier string for the version of the file's contents that was last read by this program, used for conflict resolution; for best results, use the versionTag attribute value from the Dropbox.File.Stat instance provided by readFile
	- *parentRev (String)* — alias for "lastVersionTag" that matches the HTTP API
	- *noOverwrite (Boolean)* — if set, the write will not overwrite a file with the same name that already exists; instead the contents will be written to a similarly named file (e.g. "notes (1).txt" instead of "notes.txt") 	



*Returns*
   `{Promise}` A promise that will successfully resolve into an `Object` with the following parameters

##`client.UpdateFile(identifier, content_buffer, options) `
Update and replace uploaded file content.

*Parameters*
-  `identifier {String}` Depending on the service,this should either be the path of the file to be updated or the identifier for the file.
-  `content_buffer {Buffer}` the contents to be written to the file
-  `options {Object}` (optional) one or more of the options below:	

*Returns*
   `{Promise}` A promise that will successfully resolve into an `Object` with the following parameters

##`client.DeleteFile(identifier, options) `
Deletes a file. Depending on the service the `identifier` should the destination file identifier or full path for the file.

*Parameters*
-  `parentIdentifier {String}` Depending on the service,this should either be the path of the file to be deleted or the identifier for the file.
-  `options {Object}` (optional) one or more of the options below:

*Returns*
   `{Promise}` A promise that will successfully resolve into an `Object` with the following parameters

##`client.DownloadFile(identifier, options) `
Retrieves the actual data of the file.

*Parameters*
-  `identifier {String}` Depending on the service,this should either be the path of the file to be downloaded or the identifier for the file.
-  `options {Object}` (optional) one or more of the options below:

*Returns*
   `{Promise}` A promise that will successfully resolve into an `Object` with the following parameters

##`client.GetFileInformation(identifier, options) `
Used to retrieve the metadata about a file..

*Parameters*
-   `identifier {String}` Depending on the service,this should either be the path of the file or the identifier for the file.
 `options {Object}` (optional) one or more of the options below:

*Returns*
   `{Promise}` A promise that will successfully resolve into an `Object` with the following parameters

##`client.CreateFolder(folderName, parentIdentifier, options) `
Use this API to allow users to add a new folder. Depending on the service the `parentIdentifier` should the destination folder identifier or destination path for the folder. If the user provides a folder name that already exists in the destination folder, the user will receive an error. 

*Parameters*
-  `folderName {String}` The name of the folder to be created on the cloud service
-  `parentIdentifier {String}` Depending on the service,this should either be the path of the folder to be created or the identifier for the parent folder. Use `null` if the folder should be created in the `root` cloud storage directory. 
-  `options {Object}` (optional) one or more of the options below:
	
##`client.DeleteFolder(identifier, options) `
Deletes a folder. Depending on the service the `identifier` should the destination folder identifier or full path for the folder.

*Parameters*
-  `identifier {String}` Depending on the service,this should either be the path of the folder to be deleted or the identifier for the folder.
-  `options {Object}` (optional) one or more of the options below:

*Returns*
   `{Promise}` A promise that will successfully resolve into an `Object` with the following parameters

##`client.GetFolderInformation(identifier, options) `
Used to retrieve the metadata about a folder.

*Parameters*
-  `identifier {String}` Depending on the service,this should either be the path of the folder or the identifier for the folder.
-  `options {Object}` (optional) one or more of the options below:

*Returns*
   `{Promise}` A promise that will successfully resolve into an `Object` with the following parameters

##`client.RetrieveFolderItems(identifier, options) `
Used to list the files and folders inside a folder

*Parameters*
-  `identifier {String}` Depending on the service,this should either be the path of the folder or the identifier for the folder.
-  `options {Object}` (optional) one or more of the options below:

*Returns*
   `{Promise}` A promise that will successfully resolve into an `Object` with the following parameters

##`client.Search(query, options) `
Used to find files and folders that match a query term

*Parameters*
-  `query {String}` The string to search for; can be matched against item names, descriptions, text content of a file. Depends on the cloud service.
-  `options {Object}` (optional) one or more of the options below:

*Returns*
   `{Promise}` A promise that will successfully resolve into an `Object` with the following parameters


# TODO's
- state - built-in state antiforgery token support.
- transforms
