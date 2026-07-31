Feature: Exceptions View list of runs and a run statuses

  Scenario: List all recent Data Delivery runs fails
    Given I have launched the Data Delivery Management
    When I view the landing page and the list fails to load
    Then I am presented with a message saying that there is an issue

  Scenario: View run status fails
    Given I can see the run I wish to see the status of
    When I select the 'View run status' link
    And the list fails to load
    Then I am presented with a message saying that there is an issue
