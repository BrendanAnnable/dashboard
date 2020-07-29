import fs from 'fs';
import yaml from 'yaml';

import { TeamData } from './network/network';

// Load team data (name, multicast/broadcast address, port)
// First check for the YAML config file (config.yaml)
//   If this exists, load team data from it
//   If it does not exist, load team data from the command line
// @param args An array of strings containing the positional arguments from the command line
// @param cb A callback function that will process the extracted team data
export function loadTeamData(
  args: string[],
  cb: (teamData: TeamData[]) => void,
) {
  // If the config file exists read it in instead of reading from the command line
  // Otherwise use the command line arguments
  // If there are no command line arguments, or not a multiple of 3 command line arguments, throw an error
  fs.readFile(
    'config.yaml',
    { encoding: 'utf8', flag: 'r' },
    (error: NodeJS.ErrnoException | null, data: string) => {
      if (error) {
        console.log(
          'Could not find config.yaml or config.yaml is not a file. Defaulting to command line team specification',
        );
        // Get all of the teams from the command line
        // <team name> <multicast address> <port> <team name> <multicast address> <port>
        if (args.length === 0 || args.length % 3 !== 0) {
          throw 'Either no command line arguments or an incompatible number of arguments were provided. Aborting';
        }

        // Convert command line data into a more usable format
        // Command line data is expected to be a space-separated list of team data
        // <team name> <multicast address> <port> <team name> <multicast address> <port>
        const teamData: TeamData[] = [];
        for (let i = 0; i <= args.length - 3; i += 3) {
          teamData.push({
            name: args[i],
            address: args[i + 1],
            port: Number(args[i + 2]),
          });
        }

        cb(teamData);
      } else {
        // Parse the YAML config file. It is expected to have a field named 'teams'
        // which has the same entries as TeamData
        console.log('Using config.yaml for team specification');
        cb(yaml.parse(data)['teams']);
      }
    },
  );
}
