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

package io.temporal.samples.springboot;

import io.temporal.client.WorkflowClient;
import io.temporal.client.WorkflowOptions;
import io.temporal.client.WorkflowStub;
import io.temporal.client.WorkflowUpdateException;

import io.temporal.samples.springboot.hello.Common;
import io.temporal.samples.springboot.hello.MetricWorkflow;
import io.temporal.samples.springboot.hello.WorkflowInput;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.text.SimpleDateFormat;
import java.lang.Math;

@Controller
public class MetricsController {

  @Autowired WorkflowClient client;

  @Value("${spring.profiles.active:}")
  private String activeProfile;

  @GetMapping("/hello")
  public String hello(Model model) {
    model.addAttribute("profile", activeProfile);
    return "hello";
  }

  @PostMapping(
          value = "/hello",
          consumes = {MediaType.APPLICATION_JSON_VALUE},
          produces = {MediaType.TEXT_HTML_VALUE})
  ResponseEntity helloSample(@RequestBody WorkflowInput input) {
    MetricWorkflow workflow =
            client.newWorkflowStub(
                    MetricWorkflow.class,
                    WorkflowOptions.newBuilder()
                            .setTaskQueue(Common.QUEUE_NAME)
                            .setWorkflowId(generateWorkflowId())
                            .build());

    // bypass thymeleaf, don't return template name just result
    System.out.println(getCurrentDateTime() + "| Starting workflow for input " + input.getInput());
    String result = workflow.execute(input);
    System.out.println(getCurrentDateTime() + "| The result of the workflow execution for " + input.getInput() + " is " + result);
    return new ResponseEntity<>("\"" + input.getInput() + ":" + result + "\"", HttpStatus.OK);
  }

  private static String generateWorkflowId() {
    return String.format(
            "MetricsSample-%s-%03d",
            (char) (Math.random() * 26 + 'A') +
                    "" +
                    (char) (Math.random() * 26 + 'A') +
                    (char) (Math.random() * 26 + 'A'),
            (int) (Math.random() * 999)
    );
  }

  private String getCurrentDateTime()
  {
    Date date = new Date();
    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS");
    return sdf.format(date);
  }

  @GetMapping("/metrics")
  public String metrics(Model model) {
    model.addAttribute("sample", "SDK Metrics");
    return "metrics";
  }

  @GetMapping("/customize")
  public String customize(Model model) {
    model.addAttribute("sample", "Customizing Options");
    return "customize";
  }

}
