avcs
====

# Address Verification Cloud Service API Example app

Oracle Address Verification Cloud Service lets you verify and standardize addresses in your customer relationship management (CRM) applications. For example, the service can correct city or street names that are misspelled, complete full postal codes, and standardize abbreviations like St and Pkwy. 

[For further documentation](http://docs.oracle.com/cloud/latest/datacs_common/CSDSR/GUID-F0900B3A-9910-4A6C-A1D2-B590CA4E8C17.htm)

This application comprises two parts, a python backend that delegates the API request to the Oracle API REST endpoint, and a javascript based one-page-app that demonstrates both the Search and Verify modes offered by the API. In search mode, the app uses autocomplete, in verify mode you complete fields in a form and submit the request to get a verification code and score.

# Screenshot

![Search Mode Screenshot](/avcs-screenshot.png)

