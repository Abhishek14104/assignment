import { useState, useEffect, useRef, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Paginator } from 'primereact/paginator';
import { InputSwitch } from 'primereact/inputswitch';
import { OverlayPanel } from 'primereact/overlaypanel';
import { FaChevronDown } from 'react-icons/fa';
import useApi from './hooks/useApi';
import './index.css';

interface Artwork {
  title: string;
  place_of_origin: string;
  inscriptions: string | null;
  artist_title: string;
  date_start: string;
  date_end: string;
}

function App() {
  const totalRecords = 120;
  const op = useRef<any>(null);
  const [selectedRows, setSelectedRows] = useState<Artwork[]>([]);
  const [rowClick, setRowClick] = useState<boolean>(true);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const pageSize = 12;
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);

  const { data, loading, error } = useApi(pageNumber);

  useEffect(() => {
    if (!loading && data) {
      setDataLoaded(true);
    }
  }, [data, loading]);

  const [inputValue, setInputValue] = useState<string>('');
  const [numberValue, setNumberValue] = useState<number | null>(null);
  const [remainingToSelect, setRemainingToSelect] = useState<number | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const valueAsNumber = parseFloat(inputValue);
  
    if (!isNaN(valueAsNumber) && valueAsNumber > 0) {
      const totalRowsToSelect = valueAsNumber;
  
      setSelectedRows([]);
      setRemainingToSelect(totalRowsToSelect);
      setNumberValue(totalRowsToSelect);
    } else {
      alert('Invalid number');
    }
  };

  useEffect(() => {
    if (numberValue && data) {
      let rowsToSelect: Artwork[] = [];
      let remainingRowsToSelect = remainingToSelect !== null ? remainingToSelect : numberValue;

      let currentPageData = data.slice(0, pageSize);
      let rowsFromPage = currentPageData.slice(0, Math.min(remainingRowsToSelect, pageSize));
      
      rowsToSelect = [...selectedRows, ...rowsFromPage];
      remainingRowsToSelect -= rowsFromPage.length;

      setSelectedRows(rowsToSelect);
      setRemainingToSelect(remainingRowsToSelect);
    }
  }, [numberValue, data, pageSize, rowClick]);

  const onPageChange = useCallback(async (event: { page: number }) => {
    setPageNumber(event.page + 1);

    if (remainingToSelect) {
      if (!loading) {
        let nextPageData = data.slice((event.page) * pageSize, (event.page + 1) * pageSize);
        let rowsFromPage = nextPageData.slice(0, Math.min(remainingToSelect, pageSize));

        setSelectedRows((prevSelected) => [...prevSelected, ...rowsFromPage]);
        setRemainingToSelect((prevRemaining) => prevRemaining ? prevRemaining - rowsFromPage.length : null);
      }
    }
  }, [data, pageSize, remainingToSelect]);

  const handleRowSelection = (rowData: Artwork) => {
    setSelectedRows((prevSelected) => {
      const isSelected = prevSelected.includes(rowData);
      if (isSelected) {
        return prevSelected.filter(item => item !== rowData);
      } else {
        return [...prevSelected, rowData];
      }
    });
  };

  return (
    <div className='flex justify-center items-center min-h-screen p-4'>
      <div className='w-full max-w-4xl'>
        {loading && <p>Data Loading...</p>}

        {error && <p>Error: {error}</p>}

        {!loading && !error && data && data.length > 0 ? (
          <>
            {dataLoaded && (
              <div className='flex items-center mb-4 gap-2'>
                <InputSwitch
                  inputId="rowclick"
                  checked={rowClick}
                  onChange={(e) => setRowClick(e.value)}
                />
                <label htmlFor="rowclick">Row Click</label>
              </div>
            )}

            <div className='w-full'>
              <DataTable
                value={data}
                paginator={false}
                selectionMode={rowClick ? 'multiple' : 'checkbox'}
                selection={selectedRows}
                onSelectionChange={(e: any) => setSelectedRows(e.value)}
                rowClassName={(rowData) =>
                  selectedRows.includes(rowData) ? 'bg-blue-100' : ''
                }
                className='space-y-4' 
              >
                <Column
                  header={
                    <div className="flex items-center">
                      <button type="button" onClick={(e) => op.current.toggle(e)} className="p-2"><FaChevronDown /></button>
                      <OverlayPanel ref={op}>
                        <div className='bg-white p-5 border rounded-lg'>
                          <form className='flex flex-col gap-3 ' onSubmit={handleSubmit}>
                            <input
                              type='text'
                              placeholder='Number of Rows'
                              className='border px-2 py-2 rounded-lg'
                              value={inputValue}
                              onChange={handleInputChange}
                              autoFocus 
                            />
                            <button type='submit' className='px-3 py-2 bg-slate-500 text-white rounded-lg'>Submit</button>
                          </form>
                        </div>
                      </OverlayPanel>
                    </div>
                  }
                  headerStyle={{ width: '4px' }}
                />

                <Column
                  body={(rowData: Artwork) => (
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(rowData)}
                      onChange={() => handleRowSelection(rowData)}
                      className="custom-checkbox" 
                    />
                  )}
                  headerStyle={{ width: '3rem' }}
                />
                <Column field="title" header="Title" headerStyle={{ width: '10rem' }} />
                <Column field="place_of_origin" header="Place of Origin" headerStyle={{ width: '8rem' }} />
                <Column
                  field="inscriptions"
                  header="Inscriptions"
                  body={(rowData: Artwork) => rowData.inscriptions ? rowData.inscriptions : "--"}
                  headerStyle={{ width: '25rem'}}
                />
                <Column field="artist_title" header="Artist" headerStyle={{ width: '10rem' }} />
                <Column field="date_start" header="Starting Date" headerStyle={{ width: '6rem' }} />
                <Column field="date_end" header="Ending Date" headerStyle={{ width: '6rem' }} />
              </DataTable>

              <Paginator
                first={pageSize * (pageNumber - 1)}
                rows={pageSize}
                totalRecords={totalRecords}
                onPageChange={onPageChange}
                template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                className="paginator-custom gap-5"
              />
              <p>numberValue: {numberValue}</p>
              <p>pageNumber: {pageNumber}</p>
            </div>
          </>
        ) : (
          !loading && <p>No data found</p>
        )}
      </div>
    </div>
  );
}

export default App;
