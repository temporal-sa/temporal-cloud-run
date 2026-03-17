/*
 *  Copyright (c) 2020 Temporal Technologies, Inc. All Rights Reserved
 *
 *  Copyright 2012-2016 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *  Modifications copyright (C) 2017 Uber Technologies, Inc.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License"). You may not
 *  use this file except in compliance with the License. A copy of the License is
 *  located at
 *
 *  http://aws.amazon.com/apache2.0
 *
 *  or in the "license" file accompanying this file. This file is distributed on
 *  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *  express or implied. See the License for the specific language governing
 *  permissions and limitations under the License.
 */

package io.temporal.samples.springboot.hello;

import io.temporal.activity.Activity;
import io.temporal.activity.ActivityExecutionContext;
import io.temporal.spring.boot.ActivityImpl;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@ActivityImpl(taskQueues = Common.QUEUE_NAME)
public class MetricActivityImpl implements MetricActivity {

  @Override
  public String activityA(String input) {
    // simulate some failures to trigger retries
    if (Activity.getExecutionContext().getInfo().getAttempt() < 3) {
      incRetriesCustomMetric(Activity.getExecutionContext());
      throw Activity.wrap(new NullPointerException("simulated exception"));
    }

    return "Successfully performed activityA ";
  }

  @Override
  public String activityB(String input) {
    // simulate some failures to trigger retries
    if (Activity.getExecutionContext().getInfo().getAttempt() < 5) {
      incRetriesCustomMetric(Activity.getExecutionContext());
      throw Activity.wrap(new NullPointerException("simultated exception"));
    }

    return "Successfully performed activityB ";
  }

  private void incRetriesCustomMetric(ActivityExecutionContext context) {
    context.getMetricsScope().counter("activities_retries").inc(1);
  }
}
