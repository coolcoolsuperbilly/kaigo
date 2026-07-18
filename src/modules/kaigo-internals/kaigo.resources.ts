import { ResourceDecorator as Resource, ExecutionContext } from '@nitrostack/core';
import { alertManager } from './alert-manager.js';

export class KaigoResources {
  @Resource({
    uri: 'kaigo://operations',
    name: 'Kaigo Operations',
    description: 'List of available kaigo financial and scam protection operations',
    mimeType: 'application/json'
  })
  async getOperations(uri: string, ctx: ExecutionContext) {
    ctx.logger.info('Fetching kaigo operations');

    const operations = [
      {
        name: 'check_balance',
        description: 'Check Available Balance',
        example: 'Check my balance'
      },
      {
        name: 'send_money',
        description: 'Send Money to a FUFA Handle with Scam Protection',
        example: 'Send ₹500 to rahul.verma@fufa'
      },
      {
        name: 'analyze_scam_risk',
        description: 'Analyze SMS, link, recipient handle, or text for scam risk & phishing indicators',
        example: 'Analyze this SMS: "Your HDFC account suspended. Update KYC at http://hdfc-kyc.xyz"'
      },
      {
        name: 'confirm_security_alert',
        description: 'Confirm or block a pending security alert',
        example: 'Confirm security alert [alert-id]'
      },
      {
        name: 'get_security_alerts',
        description: 'Get recent security alerts and threat statistics',
        example: 'Show recent security alerts'
      },
      {
        name: 'check_payment_requests',
        description: 'Check Available Requests',
        example: 'Check my payment requests'
      },
      {
        name: 'check_statement',
        description: 'Get Transaction Statements Both Received And Paid',
        example: 'Get transaction statements'
      },
      {
        name: 'check_applicable_pensions',
        description: 'Check Applicable Pensions',
        example: 'Check applicable pensions'
      },
      {
        name: 'check_applicable_insurances',
        description: 'Check Applicable Insurances',
        example: 'Check applicable insurances'
      },
      {
        name: 'get_insurance_status',
        description: 'Get Insurance Status',
        example: 'Get insurance status'
      },
      {
        name: 'get_pension_status',
        description: 'Get Pension Status',
        example: 'Get pension status'
      }
    ];

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({ operations }, null, 2)
        }
      ]
    };
  }

  @Resource({
    uri: 'kaigo://security-alerts',
    name: 'Kaigo Active Security Alerts',
    description: 'Active financial security alerts and scam threat metrics',
    mimeType: 'application/json'
  })
  async getSecurityAlertsResource(uri: string, ctx: ExecutionContext) {
    ctx.logger.info('Fetching kaigo security alerts resource');
    const alerts = alertManager.getAlerts();
    const stats = alertManager.getStats();

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({ stats, alerts }, null, 2)
        }
      ]
    };
  }
}
