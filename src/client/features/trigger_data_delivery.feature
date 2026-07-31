Feature: Trigger data delivery

  Scenario: Trigger data delivery
    Given I have launched the Data Delivery Management
    When I click the link 'Trigger Data Delivery'
    And I confirm I want to trigger Data Delivery
    Then Data Delivery will be triggered
    And I will be redirect to the homepage with a message saying it had been triggered successfully

  Scenario: Trigger data delivery fails
    Given I have launched the Data Delivery Management
    When I click the link 'Trigger Data Delivery'
    And I confirm I want to trigger Data Delivery
    Then Data Delivery will be triggered
    And Data Delivery fails
    Then I will be redirect to the homepage with a message saying the the trigger had failed

  Scenario: Cancel Trigger data delivery
    Given I have been presented with a confirmation to trigger data delivery
    When I confirm that I do NOT want to proceed
    Then I am returned to the landing page

  Scenario: Cancel Trigger data delivery confirmation
    Given I have been presented with a confirmation to trigger data delivery
    When I click the cancel button
    Then I am returned to the landing page

  Scenario: Don't select an option
    Given I have been presented with a confirmation to trigger data delivery
    When I select confirm without choosing an option
    Then I am presented with message telling me to choose an option
