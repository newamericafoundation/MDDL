import { IConstruct } from '@aws-cdk/core'
import {
  AliasRecordTargetConfig,
  IAliasRecordTarget,
  IRecordSet,
} from '@aws-cdk/aws-route53'
import { CloudFrontTarget } from '@aws-cdk/aws-route53-targets'

export class MinimalCloudFrontTarget implements IAliasRecordTarget {
  constructor(
    private readonly construct: IConstruct,
    private readonly domainName: string,
    private readonly hostedZoneId?: string,
  ) {}

  public bind(_record: IRecordSet): AliasRecordTargetConfig {
    return {
      hostedZoneId:
        this.hostedZoneId || CloudFrontTarget.getHostedZoneId(this.construct),
      dnsName: this.domainName,
    }
  }
}
