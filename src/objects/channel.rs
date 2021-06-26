use serde::{Serialize, Deserialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct Channel {
    pub id: Uuid,
    pub title: String,
    pub description: String,
    pub image: String,
    pub feed_id: Uuid,
}
