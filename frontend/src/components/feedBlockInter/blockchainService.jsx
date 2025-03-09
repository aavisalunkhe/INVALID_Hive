import { HIVE_CONFIG } from "../../config/hive";
import { Client } from "@hiveio/dhive";

const client = new Client(HIVE_CONFIG.nodes, { chainId: HIVE_CONFIG.chain_id });

export const fetchPosts = async (query = { tag: 'CleanTxt', limit: 20 }) => {
  try {
    return await client.database.getDiscussions('created', query);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
};

export const voteOnPost = async (username, author, permlink, onSuccess) => {
  const keychain = window.hive_keychain;
  if (!keychain) return;
  try {
    keychain.requestVote(username, permlink, author, 100, (response) => {
      if (response.success) {
        onSuccess && onSuccess(response);
      }
    });
  } catch (error) {
    console.error('Error voting:', error);
  }
};

export const saveToBlockchain = async (username, content, type = 'completed_session') => {
  if (!window.hive_keychain) {
    console.error('Hive Keychain not found');
    return false;
  }
  try {
    return new Promise((resolve, reject) => {
      window.hive_keychain.requestCustomJson(
        username,
        'CleanTxt',
        JSON.stringify({
          type,
          content,
          timestamp: Date.now(),
          app: 'CleanTxt'
        }),
        'Posting',
        'Save Completed Session',
        (response) => {
          if (response.success) {
            resolve(response);
          } else {
            reject(new Error(response.message));
          }
        }
      );
    });
  } catch (error) {
    console.error('Error saving to blockchain:', error);
    return false;
  }
};
