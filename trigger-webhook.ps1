$body = @{
  object = "page"
  entry = @(
    @{
      id = "851689741242137"
      time = 1234567890
      changes = @(
        @{
          field = "feed"
          value = @{
            item = "comment"
            verb = "add"
            post_id = "914165968455862_122101044177218045"
            comment_id = "456_789"
            message = "Ceci est un commentaire de test"
            from = @{
              id = "USER123"
              name = "Test User"
            }
            created_time = 1234567890
          }
        }
      )
    }
  )
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Method POST `
  -Uri "http://localhost:3000/api/webhooks/trigger/e1f94370-a860-4655-8933-e0a25bed5311" `
  -ContentType "application/json" `
  -Body $body