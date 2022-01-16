import { Field, Form, Formik } from 'formik';
import type { NextPage } from 'next';
import Head from 'next/head';
import { SpinnerCircular } from 'spinners-react';
import * as Yup from 'yup';

const CaseSchema = Yup.object().shape({
  classroomNumber: Yup.string()
    .required('Classroom number is required')
    .min(3, 'Must be a valid classroom number')
    .max(3, 'Must be a valid classroom number')
    .matches(/^[0-9]{1,3}$/, 'Must be a valid classroom number')
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Covid Report</title>
        <meta
          name="description"
          content="Report Covid cases in the EMSB school system"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className="flex justify-center items-center h-screen">
          <Formik
            validateOnChange
            initialValues={{ classroomNumber: '' }}
            validationSchema={CaseSchema}
            onSubmit={async (values) => {
              await sleep(2000);
            }}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="pt-6 pb-8 mb-4 w-4/5 md:w-2/5">
                <label
                  className="block text-gray-700 text-md font-bold mb-2"
                  htmlFor="classroomNumber"
                >
                  Classroom Number
                </label>
                <Field
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Classroom Number"
                  name="classroomNumber"
                  id="classroomNumber"
                  type="text"
                />
                {errors.classroomNumber && touched.classroomNumber ? (
                  <p className="text-red-600 -mb-1 md:mb-2">
                    {errors.classroomNumber}
                  </p>
                ) : null}
                <div className="flex flex-col w-full items-center mt-3 space-y-1">
                  <button
                    className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-800 text-white font-bold py-2 px-4 w-full rounded focus:outline-none focus:shadow-outline"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex flex-row justify-center">
                        <div className="inline-flex items-center mr-1">
                          <SpinnerCircular
                            className="inline-block"
                            size={15}
                            thickness={180}
                            color="#2563EB"
                            secondaryColor="#fff"
                          />
                        </div>
                        <span>Submitting</span>
                      </div>
                    ) : (
                      'Submit'
                    )}
                  </button>
                  <button
                    className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-2 px-4 w-full rounded focus:outline-none focus:shadow-outline"
                    type="button"
                  >
                    Stats
                  </button>
                </div>
                <div className="text-center">
                  <p className="mt-1 md:mt-2 text-gray-700">
                    &copy; Made by{' '}
                    <a
                      href="https://github.com/Xenfo"
                      className="text-blue-600 underline underline-offset-4"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Samuel Corsi-House
                    </a>
                  </p>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </main>
    </div>
  );
};

export default Home;
