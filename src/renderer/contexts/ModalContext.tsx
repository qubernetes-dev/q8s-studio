import React, { createContext, useContext, useState, useMemo } from 'react';
import { Q8SProject } from '../components/ConfigurationView';

export const ModalContext = createContext<
  | {
      showModal: string;
      setShowModal: (value: string) => void;
      configToEdit?: Q8SProject;
      setConfigToEdit: (config: Q8SProject | undefined) => void;
    }
  | undefined
>(undefined);

export function ModalProvider({ children }) {
  const [showModal, setShowModal] = useState('');
  const [configToEdit, setConfigToEdit] = useState<Q8SProject | undefined>(
    undefined,
  );

  const value = useMemo(
    () => ({ showModal, setShowModal, configToEdit, setConfigToEdit }),
    [showModal, configToEdit],
  );
  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  );
}

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error('useModal must be used within ModalProvider');
  return context;
};
