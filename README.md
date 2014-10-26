Ionic CouchDB Base
=====================

Getting Started
--------------

* git clone https://github.com/jrhicks/ionic-pouchdb.git

* cd ionic-pouchdb-base

* npm install

* bower install

* gulp

* http://localhost:9000

CouchDB 1.5 VM
---------------

* cd couchdb_vm

* vagrant up

* http://localhost:5984/_utils/

Data Services
---------------
* http://localhost:5984/jrhicks

* username: jrhicks

* password: .........

Setting up Users
-------------
* Create an admin and disable admin party - http://guide.couchdb.org/draft/security.html

* curl -X PUT http://localhost:5984/_config/admins/anna -d '"secret"'

* anna secret