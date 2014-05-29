chef_gem 'chef-rewind' do
  version '0.0.8'
end

require 'chef/rewind'

apt_repository 'couchdb' do
  uri 'http://ppa.launchpad.net/couchdb/stable/ubuntu'
  distribution node['lsb']['codename']
  components ['main']
  keyserver 'keyserver.ubuntu.com'
  key 'C17EAB57'
end

include_recipe 'couchdb'

rewind 'service[couchdb]' do
  stop_command '/etc/init.d/couchdb stop; sleep 1; pkill -U couchdb'
  restart_command '/etc/init.d/couchdb stop; sleep 1; pkill -U couchdb; /etc/init.d/couchdb start'
  status_command 'pgrep -u couchdb'
  supports [:restart, :status]
  action [:enable, :start]
end

unwind 'template[/etc/couchdb/local.ini]'

template '/etc/couchdb/local.d/custom.ini' do
  source 'couchdb_custom.ini.erb'
  owner 'couchdb'
  group 'couchdb'
  mode 0664
  variables :config => node['couch_db']['config']
  notifies :restart, 'service[couchdb]'
end

service 'couchdb' do
  action [:enable, :start]
end