import { useState } from 'react';
import type { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { ConnectorEditSheet } from '../../../connectors/edit';
import { ConnectorContextProvider } from '../../../data-storage/shared/model/context/connector';
import { DataStorageType } from '../../../data-storage/shared/model/types';
import type { ConnectorConfig } from '../model';

interface DataMartConnectorViewProps {
  dataStorageType: DataStorageType;
  onSubmit: (configuredConnector: ConnectorConfig) => void;
  children?: ReactNode;
  configurationOnly?: boolean; // Якщо true, показуємо тільки крок конфігурації
}

export const DataMartConnectorView = ({
  dataStorageType,
  onSubmit,
  children,
  configurationOnly = false,
}: DataMartConnectorViewProps) => {
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

  const handleTriggerClick = () => {
    setIsEditSheetOpen(true);
  };

  const handleClose = () => {
    setIsEditSheetOpen(false);
  };

  // Render trigger element with onClick handler
  const renderTrigger = () => {
    if (!children) return null;

    return (
      <div onClick={handleTriggerClick} style={{ cursor: 'pointer' }}>
        {children}
      </div>
    );
  };

  return (
    <>
      <Toaster />
      {renderTrigger()}
      <ConnectorContextProvider>
        <ConnectorEditSheet
          isOpen={isEditSheetOpen}
          onClose={handleClose}
          connector={null}
          dataStorageType={dataStorageType}
          onSubmit={onSubmit}
          configurationOnly={configurationOnly}
        />
      </ConnectorContextProvider>
    </>
  );
};
