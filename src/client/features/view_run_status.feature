Feature: View list of runs and a run statuses

  # Scenario 1
  Scenario: List all recent Data Delivery runs
    Given I have launched the Data Delivery Management
    When I view the landing page
    Then I am presented with a list of the recent data delivery runs
    And it is ordered with the most recently run at the top

  Scenario: View run status
    Given I can see the run I wish to see the status of
    When I select the 'View run status' link
    Then I am presented with a list of the surveys processed in that run
    And the status information is shown
