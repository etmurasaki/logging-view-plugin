import { Alert, Text, TextContent, TextVariants } from '@patternfly/react-core';
import React from 'react';
import { isFetchError } from '../cancellable-fetch';
import { notUndefined } from '../value-utils';
import './error-message.css';

interface ErrorMessageProps {
  error: unknown | Error;
}

const Suggestion: React.FC = ({ children }) => (
  <Text component={TextVariants.small}>{children}</Text>
);

const messages: Record<string, React.ReactElement> = {
  'max entries limit': (
    <>
      <Suggestion>Select a smaller time range to reduce the number of results</Suggestion>
      <Suggestion>
        Select a namespace, pod, or container filter to improve the query performance
      </Suggestion>
      <Suggestion>
        Increase Loki &quot;max_entries_limit_per_query&quot; entry in configuration file
      </Suggestion>
    </>
  ),
  'deadline exceeded,maximum of series': (
    <>
      <Suggestion>Select a smaller time range to reduce the number of results</Suggestion>
      <Suggestion>
        Select a namespace, pod, or container filter to improve the query performance
      </Suggestion>
    </>
  ),
  'too many outstanding requests': (
    <>
      <Suggestion>Select a smaller time range to reduce the number of results</Suggestion>
      <Suggestion>
        Select a namespace, pod, or container filter to improve the query performance
      </Suggestion>
      <Suggestion>
        Ensure Loki config contains &quot;parallelise_shardable_queries: true&quot; and
        &quot;max_outstanding_requests_per_tenant: 2048&quot;
      </Suggestion>
    </>
  ),
  'time range exceeds,maximum resolution': (
    <>
      <Suggestion>Reduce the time range to decrease the number of results</Suggestion>
      <Suggestion>
        Increase Loki &quot;max_query_length&quot; entry in configuration file
      </Suggestion>
    </>
  ),
  'cannot connect to LokiStack': (
    <>
      <Suggestion>Make sure you have an instance of LokiStack runnning</Suggestion>
    </>
  ),
};

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => {
  let errorMessage = (error as Error).message || String(error);
  let title = 'You may consider the following query changes to avoid this error';
  const status = isFetchError(error) ? error.status : undefined;

  if (status !== undefined) {
    switch (status) {
      case 502:
        title = 'This plugin requires Loki Operator and LokiStack to be running in the cluster';
        errorMessage = 'cannot connect to LokiStack';
        break;
    }
  }

  const suggestions = React.useMemo(
    () =>
      Object.keys(messages)
        .map((messageKey) => {
          const errorKeys = messageKey.split(',');
          const hasErrorKey = errorKeys.some((key) => errorMessage.includes(key));
          return hasErrorKey ? messages[messageKey] : undefined;
        })
        .filter(notUndefined),
    [errorMessage],
  );

  return (
    <>
      <Alert
        className="co-logs-error_message"
        variant="danger"
        isInline
        isPlain
        title={errorMessage}
      />

      {suggestions && suggestions.length > 0 ? (
        <TextContent>
          <Text component={TextVariants.p}>{title}</Text>

          {suggestions}
        </TextContent>
      ) : null}
    </>
  );
};
