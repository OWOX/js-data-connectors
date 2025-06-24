import { useConnector } from '../../../../data-storage/shared/model/hooks/useConnector';
import type { ConnectorDefinitionDto } from '../../../../data-storage/shared/api/types/response';
import { useEffect, useState, useCallback } from 'react';

import { DataStorageType } from '../../../../data-storage/shared/model/types';
import {
  ConnectorSelectionStep,
  ConfigurationStep,
  NodesSelectionStep,
  FieldsSelectionStep,
  TargetSetupStep,
} from './steps';
import { StepNavigation } from './components';
import type { ConnectorConfig } from '../../../../data-marts/edit/model';

interface ConnectorWizardFormProps {
  onSubmit: (connector: ConnectorConfig) => void;
  dataStorageType: DataStorageType;
  configurationOnly?: boolean;
}

export function ConnectorWizardForm({
  onSubmit,
  dataStorageType,
  configurationOnly = false,
}: ConnectorWizardFormProps) {
  const [selectedConnector, setSelectedConnector] = useState<ConnectorDefinitionDto | null>(null);
  const [selectedNode, setSelectedNode] = useState<string>('');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [connectorConfiguration, setConnectorConfiguration] = useState<Record<string, unknown>>({});
  const {
    connectors,
    connectorSpecification,
    connectorFields,
    loading,
    loadingSpecification,
    loadingFields,
    error,
    fetchAvailableConnectors,
    fetchConnectorSpecification,
    fetchConnectorFields,
  } = useConnector();
  const [target, setTarget] = useState<{
    type: DataStorageType;
    bigquery?: { datasetId: string };
    athena?: { databaseName: string; outputLocation: string };
  } | null>(null);

  const steps = configurationOnly
    ? [{ id: 1, title: 'Configuration', description: 'Set up connector parameters' }]
    : [
        { id: 1, title: 'Select Connector', description: 'Choose a data source' },
        { id: 2, title: 'Configuration', description: 'Set up connector parameters' },
        { id: 3, title: 'Select Nodes', description: 'Choose data nodes' },
        { id: 4, title: 'Select Fields', description: 'Pick specific fields' },
        { id: 5, title: 'Target Setup', description: 'Configure destination' },
      ];

  const totalSteps = steps.length;

  useEffect(() => {
    void fetchAvailableConnectors();
  }, [fetchAvailableConnectors]);

  // В режимі configurationOnly автоматично вибираємо перший коннектор
  useEffect(() => {
    if (configurationOnly && connectors.length > 0 && !selectedConnector) {
      const firstConnector = connectors[0];
      setSelectedConnector(firstConnector);
      void fetchConnectorSpecification(firstConnector.name);
    }
  }, [configurationOnly, connectors, selectedConnector, fetchConnectorSpecification]);

  const handleConnectorSelect = (connector: ConnectorDefinitionDto) => {
    setSelectedConnector(connector);
    setConnectorConfiguration({});
    void fetchConnectorSpecification(connector.name);
    void fetchConnectorFields(connector.name);
  };

  const handleFieldSelect = (fieldName: string) => {
    setSelectedNode(fieldName);
    setSelectedFields([]);
  };

  const handleFieldToggle = (fieldName: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedFields(prev => [...prev, fieldName]);
    } else {
      setSelectedFields(prev => prev.filter(f => f !== fieldName));
    }
  };

  const handleTargetChange = (newTarget: {
    type: DataStorageType;
    bigquery?: { datasetId: string };
    athena?: { databaseName: string; outputLocation: string };
  }) => {
    setTarget(newTarget);
  };

  const handleConfigurationChange = useCallback((configuration: Record<string, unknown>) => {
    setConnectorConfiguration(configuration);
  }, []);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canGoNext = () => {
    if (configurationOnly) {
      return selectedConnector !== null && currentStep === 1; // В режимі configurationOnly для кроку 1
    }

    switch (currentStep) {
      case 1:
        return selectedConnector !== null;
      case 2:
        return true;
      case 3:
        return selectedNode !== '';
      case 4:
        return selectedFields.length > 0;
      case 5:
        return target !== null;
      default:
        return false;
    }
  };

  const canGoBack = () => {
    return currentStep > 1;
  };

  const renderCurrentStep = () => {
    if (configurationOnly && currentStep === 1) {
      // В режимі конфігурації показуємо тільки крок налаштування параметрів
      return connectorSpecification ? (
        <ConfigurationStep
          connectorSpecification={connectorSpecification}
          onConfigurationChange={handleConfigurationChange}
          initialConfiguration={connectorConfiguration}
          loading={loadingSpecification}
        />
      ) : null;
    }

    switch (currentStep) {
      case 1:
        return (
          <ConnectorSelectionStep
            connectors={connectors}
            selectedConnector={selectedConnector}
            loading={loading}
            error={error}
            onConnectorSelect={handleConnectorSelect}
          />
        );
      case 2:
        return selectedConnector && connectorSpecification ? (
          <ConfigurationStep
            connectorSpecification={connectorSpecification}
            onConfigurationChange={handleConfigurationChange}
            initialConfiguration={connectorConfiguration}
            loading={loadingSpecification}
          />
        ) : null;
      case 3:
        return selectedConnector && connectorFields ? (
          <NodesSelectionStep
            connectorFields={connectorFields}
            selectedField={selectedNode}
            loading={loadingFields}
            onFieldSelect={handleFieldSelect}
          />
        ) : null;
      case 4:
        return selectedNode && connectorFields ? (
          <FieldsSelectionStep
            connectorFields={connectorFields}
            selectedField={selectedNode}
            selectedFields={selectedFields}
            onFieldToggle={handleFieldToggle}
          />
        ) : null;
      case 5:
        return (
          <TargetSetupStep
            dataStorageType={dataStorageType}
            target={target}
            onTargetChange={handleTargetChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className='space-y-6 p-4'>
      <div className='min-h-[400px]'>{renderCurrentStep()}</div>

      <StepNavigation
        currentStep={currentStep}
        totalSteps={totalSteps}
        canGoNext={canGoNext()}
        canGoBack={canGoBack()}
        isLoading={loadingSpecification || loadingFields}
        onNext={handleNext}
        onBack={handleBack}
        onFinish={() => {
          if (configurationOnly && selectedConnector) {
            // В режимі configurationOnly повертаємо тільки конфігурацію
            onSubmit({
              source: {
                name: selectedConnector.name,
                configuration: [connectorConfiguration],
                node: '', // Буде взято з попередньої конфігурації
                fields: [], // Буде взято з попередньої конфігурації
              },
              storage: {
                type: dataStorageType,
              },
            });
          } else if (selectedConnector && target) {
            // Повний режим конфігурації
            onSubmit({
              source: {
                name: selectedConnector.name,
                configuration: [connectorConfiguration],
                node: selectedNode,
                fields: selectedFields,
              },
              storage: {
                type: target.type,
                athena: target.athena,
                bigquery: target.bigquery,
              },
            });
          }
        }}
      />
    </div>
  );
}
