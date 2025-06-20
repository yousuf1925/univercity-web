import React from 'react'

const NewsCard = () => {
return (
    <div>
        <section className="max-w-xl mx-auto">
            <h3 className="text-4xl font-bold text-gray-200 mb-6">
                Admissions News
            </h3>
            <ul className="space-y-4">
                <li>
                    <div className="flex items-center bg-[#2c353d] rounded-lg shadow p-4">
                        <span className="text-lg font-semibold text-orange-400 flex-1">
                            FAST
                        </span>
                        <span className="text-white text-sm">28 June, 2025</span>
                    </div>
                </li>
                <li>
                    <div className="flex items-center bg-[#2c353d] rounded-lg shadow p-4">
                        <span className="text-lg font-semibold text-orange-400 flex-1">
                            NUST
                        </span>
                        <span className="text-white text-sm">9 July, 2025</span>
                    </div>
                </li>
                <li>
                    <div className="flex items-center bg-[#2c353d] rounded-lg shadow p-4">
                        <span className="text-lg font-semibold text-orange-400 flex-1">
                            UET
                        </span>
                        <span className="text-white text-sm">12 July, 2025</span>
                    </div>
                </li>
                <li>
                    <div className="flex items-center bg-[#2c353d] rounded-lg shadow p-4">
                        <span className="text-lg font-semibold text-orange-400 flex-1">
                            COMSATS
                        </span>
                        <span className="text-white text-sm">Soon to open</span>
                    </div>
                </li>
            </ul>
        </section>
    </div>
)
}

export default NewsCard