'use strict';

var setup = require('../spec/integration/helpers/setup')(__dirname + '/../spec/docker-compose.yml');

var generator = {
  "name": "",
  "lifecycle": "once",
  "workers": 1,
  "operations": [
    {
      "_op": "elasticsearch_data_generator",
      "size": 0
    },
    {
      "_op": "elasticsearch_index_selector",
      "index": "",
      "type": "events"
    },
    {
      "_op": "elasticsearch_bulk",
      "size": 5000
    }
  ]
}

setup.dockerUp('teracluster__jobs')
    .then(function(connections) {
        function generate(count) {
            generator.name = 'Data Generator ' + count
            generator.operations[0].size = count;
            generator.operations[1].index = 'example-logs-' + count;
            return teraslice.jobs.submit(generator)
        }

        var teraslice = connections.teraslice_client;

        console.log('--> Submitting jobs to generate test data');

        return Promise.all([
            generate(10),
            generate(1000),
            generate(10000)
        ])
    })
    .each(function(job) {
        return job.waitForStatus('completed')
    })
    .catch(console.log)
    .finally(function() {
        setup.dockerDown()
            .catch(console.log)
    });