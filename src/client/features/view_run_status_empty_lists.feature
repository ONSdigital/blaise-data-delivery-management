Feature: View list of runs and a run statuses

  Scenario: No recent Data Delivery runs found
    Given I have launched the Data Delivery Management
    When I view the landing page
    Then I am presented with a message saying that there are no runs found

  Scenario: No files found in run
    Given I can see the run I wish to see the status of
    When I view the landing page
    Then I am presented with a list of runs
    When I select the 'View run status' link
    Then I am presented with a message saying that there are no files found
