export interface WalletAdapter {
  /** Получить адрес подключенного кошелька */
  getAddress(): Promise<string | null>;
  
  /** Подписать EIP-712 типизированные данные */
  signTypedData(domain: Record<string, unknown>, types: Record<string, unknown>, value: Record<string, unknown>): Promise<string>;
  
  /** Подписать текстовое сообщение */
  signMessage(message: string): Promise<string>;
  
  /** Получить ID текущей сети */
  getChainId(): Promise<number>;
  
  /** Проверить, подключен ли кошелёк */
  isConnected(): boolean;
  
  /** Получить информацию о подключении */
  getConnectionInfo(): {
    address: string | null;
    chainId: number | null;
    isConnected: boolean;
  };
}
