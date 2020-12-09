# Dashboard

## Dependencies

- [Node](https://nodejs.org/en/download/)
- [Yarn](https://yarnpkg.com/en/docs/install)

## Installing

`yarn`

## Running

`yarn start`

## Developing components

`yarn storybook`

## Integration developing

`yarn dev`

## Integration developing without typechecking

`yarn dev -t`

## Testing

`yarn test`

## The configuration file `config.yaml`

If `config.yaml` is found in the root folder of this repository it is expected to contain team data formatted as follows.

```yaml
teams:
  - name: Red Team
    address: 239.226.152.162
    port: 9917
  - name: Blue Team
    address: 239.226.152.162
    port: 9917
```

If this file is not found then team data is expected to be found on the command line.

## Command line arguments

Command line arguments are only parsed if no cnofiguration file is found. In this instance the command line arguments are expected to be provided as a space-separated list of space-separated tuples of the form `<team name> <multicast/broadcast address> <port>`. For example,

```sh
$ yarn start "Red Team" 239.226.152.162 9917 "Blue Team" 239.226.152.162 991
```

**NOTE:** If there are any spaces (or any other special charcters) in the team name, the team name must be wrapped in double quotes (and special characters appropriately escaped).
