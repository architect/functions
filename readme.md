### <kbd>arc :cloud:</kbd>

A text format for specifying **_architure as code_**.

## Concepts

1. Define software architecture agnostic of :cloud: vendor arcana:

- Pub/Sub Events
- HTTP Endpoints
- Database Tables

2. Generate corosponding AWS Lambda infrastructure for 

- Simple Notification Service
- API Gateway
- DynamoDB

> arc is an acronym for: architecture run commands

Its shaping up to be a few packages.

- arc-parse _parses .arc files_
- arc-prototype _functions for generating lambda signatures_
- arc-generate _create infra from .arc_
- arc-nuke _destroy infra from .arc_
- arc-commands _npm run commands for .arc projects_
- arc-test _run infra offline for testing_
