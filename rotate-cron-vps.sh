#!/bin/bash
NEW_SECRET=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 32)
echo "Rotating secret to: $NEW_SECRET"
ENV_PATH="/opt/nextjs-ai-creator/nextjs-vps/.env.production"

# Update .env
if [ -f "$ENV_PATH" ]; then
    sed -i "s/^CRON_SECRET=.*/CRON_SECRET=$NEW_SECRET/" "$ENV_PATH"
    echo "Updated $ENV_PATH"
else
    echo "Error: $ENV_PATH not found"
    exit 1
fi

# Update crontab
crontab -l | sed "s/x-cron-secret: [^ \"]*/x-cron-secret: $NEW_SECRET/" | crontab -
echo "Updated crontab"

# Final check
grep "CRON_SECRET" "$ENV_PATH"
crontab -l | grep "x-cron-secret"
