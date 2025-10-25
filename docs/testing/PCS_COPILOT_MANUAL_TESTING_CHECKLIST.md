# PCS Copilot Manual Testing Checklist

## Pre-Testing Setup

- [ ] Ensure user has premium subscription
- [ ] Clear browser cache and cookies
- [ ] Test on both desktop and mobile devices
- [ ] Have test PCS data ready (dates, locations, rank, etc.)

## Phase 1: Basic Navigation

### Main PCS Copilot Page
- [ ] Navigate to `/dashboard/pcs-copilot`
- [ ] Verify redirect to `/dashboard/pcs-copilot/enhanced`
- [ ] Check premium gate for free users
- [ ] Verify page loads without errors
- [ ] Check mobile responsiveness

### Enhanced PCS Copilot Interface
- [ ] Verify all three view modes are accessible (List, Manual, Mobile)
- [ ] Check view toggle buttons work correctly
- [ ] Verify help widget is present and functional
- [ ] Check that claims list displays properly

## Phase 2: Claim Creation Flow

### Manual Entry (Desktop)
- [ ] Click "Create New Claim" button
- [ ] Verify manual entry form opens
- [ ] Test auto-population from user profile
- [ ] Fill in basic PCS information:
  - [ ] Claim name
  - [ ] PCS orders date
  - [ ] Departure date
  - [ ] Arrival date
  - [ ] Origin base
  - [ ] Destination base
- [ ] Test real-time validation:
  - [ ] Enter invalid date sequence
  - [ ] Leave required fields empty
  - [ ] Verify validation flags appear
- [ ] Save draft claim
- [ ] Verify claim appears in list

### Mobile Wizard
- [ ] Switch to mobile view
- [ ] Click "Create New Claim"
- [ ] Verify mobile wizard opens
- [ ] Test progressive steps:
  - [ ] Basic Info step
  - [ ] Travel Method step
  - [ ] Lodging step
  - [ ] Travel Costs step
  - [ ] Weight & Distance step
  - [ ] Review step
- [ ] Test navigation between steps
- [ ] Test save draft functionality
- [ ] Test complete claim creation

## Phase 3: Calculation Engine

### DLA Calculation
- [ ] Enter rank (E5, O3, etc.)
- [ ] Enter dependents count
- [ ] Verify DLA amount calculates correctly
- [ ] Check confidence score displays
- [ ] Verify data source shows "DFAS Pay Tables API"

### MALT Calculation
- [ ] Enter distance in miles
- [ ] Verify MALT rate (should be $0.18/mile)
- [ ] Check calculation accuracy
- [ ] Verify confidence score

### Per Diem Calculation
- [ ] Enter number of travel days
- [ ] Verify per diem rate calculation
- [ ] Check location-specific rates (if available)
- [ ] Verify fallback to standard CONUS rate

### TLE Calculation
- [ ] Enter origin nights (max 10)
- [ ] Enter destination nights (max 10)
- [ ] Enter lodging rates
- [ ] Verify TLE calculation
- [ ] Check JTR compliance (10-night limit)

### PPM Calculation
- [ ] Enter estimated weight
- [ ] Enter actual weight (if available)
- [ ] Enter distance
- [ ] Verify PPM estimate
- [ ] Check weight allowance compliance

## Phase 4: Validation Engine

### Field-Level Validation
- [ ] Test required field validation
- [ ] Test date format validation
- [ ] Test numeric field validation
- [ ] Test rank format validation
- [ ] Verify error messages are helpful

### Cross-Field Validation
- [ ] Test date sequence validation
- [ ] Test dependent count vs rank validation
- [ ] Test weight vs distance validation
- [ ] Verify JTR rule compliance

### Real-Time Validation
- [ ] Enter data and watch validation flags appear
- [ ] Test validation flag explanations
- [ ] Verify AI explanations are helpful
- [ ] Test validation flag resolution

## Phase 5: Error Handling

### API Failures
- [ ] Simulate network failure
- [ ] Verify graceful degradation
- [ ] Check fallback calculations work
- [ ] Verify user feedback messages
- [ ] Test error recovery

### Data Quality Issues
- [ ] Test with stale rate data
- [ ] Verify confidence scores reflect data quality
- [ ] Check provenance information
- [ ] Test warning messages

## Phase 6: User Experience

### Loading States
- [ ] Test calculation loading indicators
- [ ] Verify save operation feedback
- [ ] Check form submission states
- [ ] Test error state handling

### Mobile Experience
- [ ] Test touch interactions
- [ ] Verify form field accessibility
- [ ] Check keyboard navigation
- [ ] Test offline capability (PWA)

### Accessibility
- [ ] Test screen reader compatibility
- [ ] Verify keyboard navigation
- [ ] Check color contrast
- [ ] Test focus management

## Phase 7: Advanced Features

### RAG AI Integration
- [ ] Test embedded help widget
- [ ] Ask context-aware questions
- [ ] Verify smart question templates
- [ ] Test proactive recommendations

### Confidence Scoring
- [ ] Verify confidence scores display
- [ ] Test data source provenance
- [ ] Check last verified timestamps
- [ ] Test confidence breakdown

### Admin Dashboard
- [ ] Navigate to admin dashboard
- [ ] Check PCS Copilot metrics
- [ ] Verify data quality monitoring
- [ ] Test usage analytics

## Phase 8: End-to-End Workflow

### Complete PCS Claim
- [ ] Create new claim
- [ ] Fill in all required information
- [ ] Run calculations
- [ ] Review confidence scores
- [ ] Save claim
- [ ] Verify claim appears in list
- [ ] Test claim editing
- [ ] Test claim deletion

### Data Persistence
- [ ] Verify claims save to database
- [ ] Test claim retrieval
- [ ] Verify calculation snapshots
- [ ] Test analytics tracking

## Phase 9: Performance Testing

### Load Testing
- [ ] Test with multiple claims
- [ ] Verify calculation performance
- [ ] Check memory usage
- [ ] Test concurrent users

### Mobile Performance
- [ ] Test on slow connections
- [ ] Verify PWA offline mode
- [ ] Check battery usage
- [ ] Test background sync

## Phase 10: Security Testing

### Authentication
- [ ] Test premium access control
- [ ] Verify user data isolation
- [ ] Test session management
- [ ] Check API security

### Data Protection
- [ ] Verify PII handling
- [ ] Test data encryption
- [ ] Check audit logging
- [ ] Verify GDPR compliance

## Success Criteria

### Functionality
- [ ] All calculations work correctly
- [ ] Validation catches errors
- [ ] Error handling prevents crashes
- [ ] Mobile wizard is fully functional
- [ ] Real-time validation works

### User Experience
- [ ] Clear error messages
- [ ] Helpful validation feedback
- [ ] Smooth mobile experience
- [ ] Fast loading times
- [ ] Intuitive navigation

### Data Quality
- [ ] Calculations use real rates
- [ ] Confidence scores are accurate
- [ ] Data sources are properly cited
- [ ] Fallback rates are clearly marked
- [ ] JTR compliance is enforced

## Bug Reporting

For any issues found during testing:

1. **Screenshot/Video**: Capture the issue
2. **Steps to Reproduce**: Document exact steps
3. **Expected vs Actual**: Describe what should happen vs what happened
4. **Browser/Device**: Note testing environment
5. **Severity**: Critical, High, Medium, Low
6. **Priority**: P1 (blocking), P2 (important), P3 (nice to have)

## Test Completion

- [ ] All critical paths tested
- [ ] All major features verified
- [ ] Performance meets requirements
- [ ] Security requirements met
- [ ] User experience is satisfactory
- [ ] Ready for beta testing

---

**Tested by:** _________________  
**Date:** _________________  
**Version:** PCS Copilot Elite v1.0  
**Status:** ✅ Ready for Production
