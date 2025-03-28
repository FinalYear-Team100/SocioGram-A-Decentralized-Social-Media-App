use near_sdk::{
    borsh::{BorshDeserialize, BorshSerialize},
    near_bindgen, env, AccountId, PanicOnDefault, collections::UnorderedMap, BorshStorageKey,
};
use serde::{Deserialize, Serialize};

#[derive(BorshSerialize, BorshDeserialize, BorshStorageKey)]
enum StorageKey {
    Users,
    Messages,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct NearChat {
    users: UnorderedMap<AccountId, String>,
    messages: UnorderedMap<u64, Message>,
    message_count: u64,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct Message {
    pub sender: AccountId,
    pub receiver: AccountId,
    pub content: String,
}

#[near_bindgen]
impl NearChat {
    #[init]
    pub fn new() -> Self {
        assert!(!env::state_exists(), "Contract is already initialized!");
        Self {
            users: UnorderedMap::new(StorageKey::Users),
            messages: UnorderedMap::new(StorageKey::Messages),
            message_count: 0,
        }
    }

    pub fn register_user(&mut self, username: String) {
        let account_id = env::signer_account_id();
        assert!(
            self.users.get(&account_id).is_none(),
            "User already registered"
        );
        self.users.insert(&account_id, &username);
    }

    pub fn send_message(&mut self, receiver: AccountId, content: String) {
    env::log_str(&format!("Received message: receiver={}, content={}", receiver, content));
    let sender = env::signer_account_id();
    assert!(self.users.get(&sender).is_some(), "Sender not registered");
    assert!(self.users.get(&receiver).is_some(), "Receiver not registered");

    let message = Message {
        sender: sender.clone(),
        receiver: receiver.clone(),
        content,
    };

    self.messages.insert(&self.message_count, &message);
    self.message_count += 1;
}


    pub fn view_users(&self) -> Vec<(AccountId, String)> {
        self.users.iter().collect()
    }

    pub fn get_messages(&self, user: AccountId) -> Vec<Message> {
        let mut result = Vec::new();
        for (_, msg) in self.messages.iter() {
            if msg.sender == user || msg.receiver == user {
                result.push(msg);
            }
        }
        result
    }

    pub fn get_methods(&self) -> Vec<String> {
        vec![
            "register_user".to_string(),
            "send_message".to_string(),
            "view_users".to_string(),
            "get_messages".to_string(),
            "clear_storage".to_string(),
        ]
    }
    pub fn clear_storage(&mut self) {
        assert_eq!(
            env::signer_account_id(),
            env::current_account_id(),
            "Only the contract owner can clear storage"
        );
        self.messages.clear();
        self.message_count = 0;
    }
}

