CREATE TABLE IF NOT EXISTS knowledge_items (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Approved',
  source_file TEXT,
  embedding_status TEXT NOT NULL DEFAULT 'Not indexed',
  embedding_model_id TEXT,
  last_indexed_at TEXT,
  chunks_indexed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS knowledge_embeddings (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  knowledge_item_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  model_id TEXT NOT NULL,
  dimensions INTEGER NOT NULL,
  embedding_json TEXT NOT NULL,
  chunk_index INTEGER NOT NULL DEFAULT 0,
  source_type TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(knowledge_item_id) REFERENCES knowledge_items(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_knowledge_items_org_type ON knowledge_items(organization_id, type);
CREATE INDEX IF NOT EXISTS idx_knowledge_embeddings_org ON knowledge_embeddings(organization_id);

INSERT OR IGNORE INTO credit_rules (id, action_name, credit_cost, description)
VALUES
  ('credit_create_embedding', 'CREATE_EMBEDDING', 1, 'Create embedding per knowledge item or chunk'),
  ('credit_knowledge_search', 'KNOWLEDGE_SEARCH', 1, 'Knowledge search');
