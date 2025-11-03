#!/bin/bash
# Quick setup script for MongoDB connection
# NOTE: Do NOT hardcode real credentials in this script.
# Provide your own URI via environment or prompt.

if [ -z "$MONGODB_URI" ]; then
  echo "Enter your MongoDB Atlas URI (e.g., mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/horizontrader?retryWrites=true&w=majority)"
  read -r MONGODB_URI
fi

export MONGODB_URI

echo "✅ MongoDB URI exported to environment"
echo "Now you can run: npm start"
