# PCS Copilot End-to-End Testing Guide

## Overview
This guide provides comprehensive testing procedures for the PCS Copilot tool, ensuring all features work correctly from claim creation to final export.

## Pre-Testing Setup

### 1. Test Environment
- [ ] **Development Server**: `npm run dev` running successfully
- [ ] **Database**: Supabase connection established
- [ ] **Authentication**: Clerk authentication working
- [ ] **Environment Variables**: All required variables set

### 2. Test Data Preparation
- [ ] **User Profile**: Complete profile with rank, branch, dependents
- [ ] **Sample Documents**: Receipts, PCS orders, weight tickets
- [ ] **Test Claims**: Various scenarios (CONUS, OCONUS, with/without dependents)

## Test Scenarios

### Scenario 1: First-Time User Journey

#### 1.1 Onboarding Flow
- [ ] **Access PCS Copilot**: Navigate to `/dashboard/pcs-copilot`
- [ ] **Onboarding Tour**: Verify tour appears for new users
- [ ] **Tour Navigation**: Complete all tour steps
- [ ] **Tour Completion**: Verify tour completion and localStorage update
- [ ] **Skip Tour**: Test tour skip functionality

#### 1.2 Feature Discovery
- [ ] **Help System**: Access help system from header
- [ ] **Search Help**: Search for specific topics
- [ ] **Category Filter**: Filter help articles by category
- [ ] **Article Reading**: Read and navigate help articles

### Scenario 2: Manual Claim Creation

#### 2.1 Basic Information
- [ ] **Claim Name**: Enter descriptive claim name
- [ ] **PCS Orders Date**: Select valid date
- [ ] **Departure Date**: Select departure date
- [ ] **Arrival Date**: Select arrival date
- [ ] **Origin Base**: Enter origin base name
- [ ] **Destination Base**: Enter destination base name
- [ ] **Travel Method**: Select DITY, Full, or Partial

#### 2.2 Dependent Information
- [ ] **Dependent Count**: Enter number of dependents
- [ ] **Rank at PCS**: Select current rank
- [ ] **Branch**: Select service branch

#### 2.3 Lodging Information
- [ ] **Origin TLE Nights**: Enter nights at origin
- [ ] **Destination TLE Nights**: Enter nights at destination
- [ ] **TLE Rates**: Enter lodging rates

#### 2.4 Travel Details
- [ ] **MALT Distance**: Enter travel distance
- [ ] **Per Diem Days**: Enter travel days
- [ ] **Fuel Receipts**: Enter fuel expenses

#### 2.5 Weight Allowance
- [ ] **Estimated Weight**: Enter estimated weight
- [ ] **Actual Weight**: Enter actual weight

### Scenario 3: Document Upload and OCR

#### 3.1 Document Upload
- [ ] **Drag and Drop**: Upload documents via drag and drop
- [ ] **File Selection**: Upload documents via file picker
- [ ] **Multiple Files**: Upload multiple documents at once
- [ ] **File Types**: Test PDF, JPG, PNG formats
- [ ] **File Size**: Test files within 10MB limit

#### 3.2 OCR Processing
- [ ] **Receipt Processing**: Upload gas receipt, verify OCR
- [ ] **Order Processing**: Upload PCS orders, verify extraction
- [ ] **Lodging Receipt**: Upload hotel receipt, verify data
- [ ] **Manual Correction**: Edit extracted information
- [ ] **Re-upload**: Test re-uploading corrected documents

#### 3.3 Document Management
- [ ] **Document List**: View all uploaded documents
- [ ] **Document Preview**: Preview document thumbnails
- [ ] **Document Deletion**: Delete unwanted documents
- [ ] **Document Organization**: Organize by category

### Scenario 4: AI Calculations

#### 4.1 Calculation Trigger
- [ ] **Manual Entry**: Trigger calculations from manual entry
- [ ] **Document Upload**: Trigger calculations from document upload
- [ ] **Form Changes**: Trigger calculations on form updates

#### 4.2 Calculation Results
- [ ] **DLA Calculation**: Verify DLA amount and confidence
- [ ] **TLE Calculation**: Verify TLE amount and nights
- [ ] **MALT Calculation**: Verify mileage and rate application
- [ ] **Per Diem Calculation**: Verify daily rates and days
- [ ] **PPM Calculation**: Verify weight allowance and distance

#### 4.3 Confidence Display
- [ ] **Overall Confidence**: Check overall confidence score
- [ ] **Data Sources**: Verify data source citations
- [ ] **Last Updated**: Check data freshness timestamps
- [ ] **Provenance**: Verify calculation provenance

### Scenario 5: JTR Validation

#### 5.1 Validation Trigger
- [ ] **Manual Validation**: Click "Validate JTR" button
- [ ] **Automatic Validation**: Verify auto-validation on changes
- [ ] **Validation Loading**: Check validation loading states

#### 5.2 Validation Results
- [ ] **Green Flags**: Verify compliant items
- [ ] **Yellow Flags**: Check optimization suggestions
- [ ] **Red Flags**: Verify non-compliant items
- [ ] **Rule Citations**: Check JTR rule references

#### 5.3 AI Explanations
- [ ] **Explanation Generation**: Request AI explanations
- [ ] **Explanation Content**: Verify explanation quality
- [ ] **Source Citations**: Check knowledge base sources
- [ ] **Suggested Fixes**: Verify actionable recommendations

### Scenario 6: Export and Claim Packages

#### 6.1 PDF Export
- [ ] **PDF Generation**: Generate PDF claim package
- [ ] **PDF Content**: Verify all sections included
- [ ] **PDF Download**: Test PDF download functionality
- [ ] **PDF Quality**: Check PDF formatting and layout

#### 6.2 Excel Export
- [ ] **Excel Generation**: Generate Excel workbook
- [ ] **Excel Sheets**: Verify multiple sheets created
- [ ] **Excel Data**: Check data accuracy and formatting
- [ ] **Excel Download**: Test Excel download functionality

#### 6.3 Claim Summary
- [ ] **Summary Page**: Access printable summary
- [ ] **Summary Content**: Verify all claim details
- [ ] **Print Function**: Test print functionality
- [ ] **QR Code**: Verify QR code generation

### Scenario 7: Mobile Experience

#### 7.1 Mobile Detection
- [ ] **Mobile View**: Verify mobile interface on small screens
- [ ] **Touch Targets**: Check 44px minimum touch targets
- [ ] **Form Inputs**: Verify no zoom on input focus
- [ ] **Navigation**: Test mobile navigation

#### 7.2 Mobile Wizard
- [ ] **Step Navigation**: Test step-by-step wizard
- [ ] **Progress Indicator**: Verify progress display
- [ ] **Form Validation**: Check mobile form validation
- [ ] **Auto-save**: Test auto-save functionality

#### 7.3 Mobile Optimization
- [ ] **Loading Performance**: Check mobile loading times
- [ ] **Touch Interactions**: Test touch gestures
- [ ] **Responsive Layout**: Verify layout adaptation
- [ ] **Mobile Help**: Test mobile help system

### Scenario 8: Sub-Pages and Advanced Features

#### 8.1 Claims Library
- [ ] **Library Access**: Navigate to claims library
- [ ] **Claim List**: View all user claims
- [ ] **Filtering**: Test claim filtering options
- [ ] **Search**: Test claim search functionality
- [ ] **Claim Details**: View individual claim details

#### 8.2 Cost Comparison
- [ ] **Comparison Tool**: Access cost comparison
- [ ] **Move Types**: Compare DITY vs Full vs Partial
- [ ] **Cost Analysis**: Verify cost calculations
- [ ] **Recommendations**: Check optimization suggestions

#### 8.3 Assignment Planner
- [ ] **Planner Access**: Navigate to assignment planner
- [ ] **Base Selection**: Select multiple bases
- [ ] **Cost Comparison**: Compare base costs
- [ ] **Recommendations**: Check base recommendations

### Scenario 9: Error Handling and Edge Cases

#### 9.1 Network Issues
- [ ] **Offline Mode**: Test offline functionality
- [ ] **Slow Connection**: Test with slow 3G
- [ ] **Connection Loss**: Test connection recovery
- [ ] **Timeout Handling**: Test request timeouts

#### 9.2 Data Validation
- [ ] **Invalid Dates**: Test invalid date inputs
- [ ] **Negative Values**: Test negative number inputs
- [ ] **Missing Required Fields**: Test required field validation
- [ ] **Invalid File Types**: Test unsupported file uploads

#### 9.3 Error Recovery
- [ ] **Error Messages**: Verify clear error messages
- [ ] **Recovery Actions**: Test error recovery options
- [ ] **Data Persistence**: Verify data not lost on errors
- [ ] **Retry Mechanisms**: Test retry functionality

### Scenario 10: Performance and Load Testing

#### 10.1 Load Testing
- [ ] **Multiple Claims**: Create multiple claims
- [ ] **Large Documents**: Upload large document files
- [ ] **Concurrent Users**: Test with multiple users
- [ ] **Database Load**: Monitor database performance

#### 10.2 Performance Metrics
- [ ] **Page Load Time**: Verify < 3 second load times
- [ ] **Calculation Speed**: Check calculation performance
- [ ] **Export Speed**: Test export generation time
- [ ] **Memory Usage**: Monitor memory consumption

## Test Data Requirements

### Sample Claims
1. **CONUS to CONUS**: E5 with dependents, 500 miles
2. **OCONUS to CONUS**: O3 with dependents, international move
3. **CONUS to OCONUS**: E7 without dependents, overseas assignment
4. **Short Distance**: E4 without dependents, 50 miles
5. **Long Distance**: O5 with dependents, 2000 miles

### Sample Documents
1. **PCS Orders**: Official military orders
2. **Gas Receipts**: Multiple fuel receipts
3. **Lodging Receipts**: Hotel and TLE receipts
4. **Weight Tickets**: PPM weight documentation
5. **Meal Receipts**: Per diem meal receipts

### Test Scenarios
1. **New User**: First-time PCS Copilot user
2. **Returning User**: User with existing claims
3. **Premium User**: User with premium features
4. **Mobile User**: Mobile-only user experience
5. **Admin User**: Administrative access testing

## Success Criteria

### Functional Requirements
- [ ] **All calculations accurate**: Within 1% of expected values
- [ ] **All validations working**: JTR compliance verified
- [ ] **All exports functional**: PDF and Excel generation
- [ ] **All uploads working**: Document processing successful
- [ ] **All mobile features**: Touch-optimized interface

### Performance Requirements
- [ ] **Page load time**: < 3 seconds
- [ ] **Calculation time**: < 5 seconds
- [ ] **Export generation**: < 10 seconds
- [ ] **Document processing**: < 30 seconds
- [ ] **Mobile responsiveness**: < 2 seconds

### User Experience Requirements
- [ ] **Onboarding completion**: 100% of new users complete tour
- [ ] **Task completion**: 95% of users complete claims
- [ ] **Error rate**: < 2% of user actions result in errors
- [ ] **User satisfaction**: > 4.5/5 rating
- [ ] **Help system usage**: 80% of users find help useful

## Test Execution Checklist

### Pre-Test
- [ ] **Environment setup**: All systems ready
- [ ] **Test data prepared**: Sample claims and documents
- [ ] **Test accounts created**: Various user types
- [ ] **Monitoring enabled**: Performance and error tracking

### During Test
- [ ] **Document everything**: Record all test results
- [ ] **Capture screenshots**: Visual evidence of issues
- [ ] **Note performance**: Timing and resource usage
- [ ] **Test edge cases**: Unusual scenarios and inputs

### Post-Test
- [ ] **Compile results**: Aggregate all test findings
- [ ] **Prioritize issues**: Rank by severity and impact
- [ ] **Create fixes**: Develop solutions for identified issues
- [ ] **Retest fixes**: Verify all issues resolved
- [ ] **Performance review**: Analyze performance metrics
- [ ] **User feedback**: Collect and analyze user feedback

## Conclusion

This comprehensive testing guide ensures the PCS Copilot tool meets all functional, performance, and user experience requirements. Regular testing and monitoring will help maintain the high standards expected by military users.

The tool is ready for production deployment when all test scenarios pass successfully and performance metrics meet the specified criteria.
