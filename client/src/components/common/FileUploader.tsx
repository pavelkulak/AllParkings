import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploaderProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  children: React.ReactNode;
  maxFiles?: number;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  files,
  onFilesChange,
  children,
  maxFiles = 5,
  acceptedFileTypes = ['image/jpeg', 'image/png'],
  maxFileSize = 5 * 1024 * 1024
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesChange(acceptedFiles);
  }, [onFilesChange]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles,
    maxSize: maxFileSize
  });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {children}
    </div>
  );
}; 