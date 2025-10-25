# Mock Data for Testing

This folder contains mock data for testing the service publishing functionality.

## Files

- `service-data.json`: Complete mock data including sample services and test form submissions

## Usage

### Service Data Structure

The `service-data.json` file contains:

1. **Main Service Example**: A complete AI Writing Assistant service with all fields
2. **Test Cases**: Minimal and complex service examples for different scenarios
3. **Form Test Data**: Pre-filled form data for manual testing

### Database Fields Mapping

When using this data to test form submissions, ensure these fields are properly mapped:

#### Required Service Fields:

- `name` (string)
- `description` (string)
- `category` (string)
- `webhook_url` (string, required)
- `features` (array of strings)

#### Optional Service Fields:

- `monthly_price`, `quarterly_price`, `yearly_price` (numbers)
- `auto_renewal` (boolean)
- `custom_fields` (array of objects with `name`, `type`, `required`)

#### Custom Fields Structure:

```json
{
  "name": "field_name",
  "type": "text|email|number|url",
  "required": true|false
}
```

### Testing Instructions

1. **Manual Form Testing**: Use the data in `form_test_data` to manually fill out the publish form
2. **Database Verification**: Check that records are properly inserted with all fields
3. **Webhook Integration**: Verify webhook URLs and custom fields are stored correctly
4. **Frontend Display**: Ensure services display properly on discovery and detail pages

### Sample API Calls

For testing webhook integration:

```bash
# Test webhook payload for subscription activation
curl -X POST https://your-webhook-url.com/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "subscription_activated",
    "service_id": "service-uuid",
    "subscriber_address": "wallet-address",
    "custom_fields": {
      "email": "user@example.com",
      "company": "Example Corp"
    },
    "subscription_details": {
      "plan": "monthly",
      "price": 29.99,
      "start_date": "2024-01-01T00:00:00Z"
    }
  }'
```

### Validation Checklist

- [ ] Service name and description are required
- [ ] Webhook URL is required and valid
- [ ] At least one pricing plan is enabled
- [ ] Custom fields have valid names and types
- [ ] Database record created successfully
- [ ] Service appears in discovery page
- [ ] Service detail page loads correctly
- [ ] Subscription flow works with custom fields
