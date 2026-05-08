"use client";

import dynamic from 'next/dynamic';

const Barcode = dynamic(() => import('react-barcode'), { ssr: false });

interface BarcodeWrapperProps {
  value: string;
  width?: number;
  height?: number;
  fontSize?: number;
  background?: string;
}

export default function BarcodeWrapper(props: BarcodeWrapperProps) {
  return <Barcode {...props} />;
}
