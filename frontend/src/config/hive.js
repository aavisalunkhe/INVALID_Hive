import { Client } from '@hiveio/dhive';

export const HIVE_CONFIG = {
  // nodes: [
  //   'https://testnet.openhive.network/',
  //   'https://testblog.openhive.network/',
  //   'https://testnet.hive.blog'
  // ],
  // chain_id: '18dcf0a285365fc58b71f18b3d3fec954aa0c141c44e4e5cb4cf777b9eab274e'
  nodes: [
    'https://api.openhive.network',
    'https://api.hive.blog',
    'https://anyx.io',
    
  ],
  chain_id: 'beeab0de00000000000000000000000000000000000000000000000000000000'
};
export const getHiveClient = () => {
  return new Client(HIVE_CONFIG.nodes, { 
    chainId: HIVE_CONFIG.chain_id 
  });
};