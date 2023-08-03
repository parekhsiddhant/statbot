# statbot

This is an AI assistant cum chatbot which represents any client of your choice and assists your users with their concerns.

It has the following flow for user query
-> User messages bot (Whatsapp Client)
-> Bot checks for existing conversation (MongoDB)
-> Embedding created for the query (Embedding model)
-> Semantic search performed for the embedding (Approximate nearest neighbours - Vector Database)
-> An answer is formed based on query and context received from above (LLM - gpt3.5-turbo)
-> User gets response

To create context
-> Create accurate data files
-> Read the file
-> Chunk text from file
-> Embed chunks
-> Store it to Vector Database
